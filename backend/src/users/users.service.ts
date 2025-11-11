import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        avatar: dto.avatar,
      },
      include: { organization: true },
    });

    return this.sanitizeUser(user);
  }

  async getTransferHistory(userId: string, limit = 50) {
    return this.prisma.transfer.findMany({
      where: { userId },
      include: {
        files: true,
        downloads: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getStorageUsage(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        usedStorageBytes: true,
        organization: {
          select: {
            maxStorageBytes: true,
          },
        },
      },
    });

    return {
      used: user.usedStorageBytes,
      limit: user.organization?.maxStorageBytes || 2147483648, // 2GB default
      percentage: (user.usedStorageBytes / (user.organization?.maxStorageBytes || 2147483648)) * 100,
    };
  }

  async delete(id: string) {
    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }

  private sanitizeUser(user: any) {
    const { password, resetToken, verificationToken, ...sanitized } = user;
    return sanitized;
  }
}
