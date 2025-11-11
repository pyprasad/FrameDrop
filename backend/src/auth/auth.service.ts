import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma/prisma.service';
import { User, AuthProvider } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        authProvider: AuthProvider.LOCAL,
      },
    });

    // Generate JWT
    const token = await this.generateToken(user);

    // Log audit
    await this.createAuditLog('USER_CREATED', user.id);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT
    const token = await this.generateToken(user);

    // Log audit
    await this.createAuditLog('USER_LOGIN', user.id);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async validateSamlUser(profile: any): Promise<User> {
    const email = profile.email || profile.nameID;

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Auto-provision user from SAML
      user = await this.prisma.user.create({
        data: {
          email,
          firstName: profile.firstName || profile.givenName,
          lastName: profile.lastName || profile.surname,
          authProvider: AuthProvider.SAML,
          ssoId: profile.nameID,
          emailVerified: true, // Trust SSO provider
        },
      });

      await this.createAuditLog('USER_CREATED', user.id);
    } else if (user.authProvider !== AuthProvider.SAML) {
      // Update to SAML if user exists with different provider
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          authProvider: AuthProvider.SAML,
          ssoId: profile.nameID,
        },
      });
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.createAuditLog('USER_LOGIN', user.id);

    return user;
  }

  async validateOAuthUser(profile: any): Promise<User> {
    const email = profile.email || profile.emails?.[0]?.value;

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Auto-provision user from OAuth
      user = await this.prisma.user.create({
        data: {
          email,
          firstName: profile.name?.givenName || profile.given_name,
          lastName: profile.name?.familyName || profile.family_name,
          avatar: profile.photos?.[0]?.value || profile.picture,
          authProvider: this.determineOAuthProvider(profile.provider),
          ssoId: profile.id,
          emailVerified: true,
        },
      });

      await this.createAuditLog('USER_CREATED', user.id);
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.createAuditLog('USER_LOGIN', user.id);

    return user;
  }

  async generateToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private sanitizeUser(user: User) {
    const { password, resetToken, verificationToken, ...sanitized } = user;
    return sanitized;
  }

  private determineOAuthProvider(provider: string): AuthProvider {
    const lowerProvider = provider?.toLowerCase();
    if (lowerProvider?.includes('google')) return AuthProvider.GOOGLE;
    if (lowerProvider?.includes('azure')) return AuthProvider.AZURE_AD;
    if (lowerProvider?.includes('okta')) return AuthProvider.OKTA;
    return AuthProvider.OAUTH;
  }

  private async createAuditLog(action: string, userId: string, metadata?: any) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: action as any,
          userId,
          metadata,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || user.authProvider !== AuthProvider.LOCAL) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset token (in production, send via email)
    const resetToken = Math.random().toString(36).substring(2);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    // TODO: Send email with reset token

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gte: new Date() },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: 'Password reset successful' };
  }
}
