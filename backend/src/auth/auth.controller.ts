import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ResetPasswordDto } from './dto/auth.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async getCurrentUser(@CurrentUser() user: any) {
    return user;
  }

  // SAML SSO endpoints
  @Public()
  @Get('saml')
  @UseGuards(AuthGuard('saml'))
  @ApiOperation({ summary: 'Initiate SAML SSO login' })
  async samlLogin() {
    // Redirect handled by Passport
  }

  @Public()
  @Post('saml/callback')
  @UseGuards(AuthGuard('saml'))
  @ApiOperation({ summary: 'SAML SSO callback' })
  async samlCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const token = await this.authService.generateToken(user);

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  // OAuth 2.0 endpoints
  @Public()
  @Get('oauth')
  @UseGuards(AuthGuard('oauth'))
  @ApiOperation({ summary: 'Initiate OAuth login' })
  async oauthLogin() {
    // Redirect handled by Passport
  }

  @Public()
  @Get('oauth/callback')
  @UseGuards(AuthGuard('oauth'))
  @ApiOperation({ summary: 'OAuth callback' })
  async oauthCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    const token = await this.authService.generateToken(user);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  // Password reset
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.requestPasswordReset(email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
