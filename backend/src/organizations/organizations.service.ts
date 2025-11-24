import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrganizationDto) {
    // Check if slug is taken
    const existing = await this.prisma.organization.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException('Organization slug already exists');
    }

    return this.prisma.organization.create({
      data: dto,
    });
  }

  async findAll(limit = 50) {
    return this.prisma.organization.findMany({
      take: limit,
      include: {
        _count: {
          select: {
            users: true,
            transfers: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            transfers: true,
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async findBySlug(slug: string) {
    return this.prisma.organization.findUnique({
      where: { slug },
    });
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    return this.prisma.organization.update({
      where: { id },
      data: dto,
    });
  }

  async updateSsoConfig(id: string, ssoConfig: any) {
    return this.prisma.organization.update({
      where: { id },
      data: {
        ssoEnabled: ssoConfig.enabled,
        samlEntryPoint: ssoConfig.samlEntryPoint,
        samlIssuer: ssoConfig.samlIssuer,
        samlCert: ssoConfig.samlCert,
        oauthClientId: ssoConfig.oauthClientId,
        oauthClientSecret: ssoConfig.oauthClientSecret,
        authProvider: ssoConfig.authProvider,
      },
    });
  }

  async getUsers(id: string) {
    return this.prisma.user.findMany({
      where: { organizationId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAnalytics(id: string) {
    const [
      totalTransfers,
      activeTransfers,
      totalDownloads,
      totalStorageUsed,
      userCount,
    ] = await Promise.all([
      this.prisma.transfer.count({
        where: { organizationId: id },
      }),
      this.prisma.transfer.count({
        where: {
          organizationId: id,
          status: 'ACTIVE',
        },
      }),
      this.prisma.download.count({
        where: {
          transfer: {
            organizationId: id,
          },
        },
      }),
      this.prisma.user.aggregate({
        where: { organizationId: id },
        _sum: {
          usedStorageBytes: true,
        },
      }),
      this.prisma.user.count({
        where: { organizationId: id },
      }),
    ]);

    return {
      totalTransfers,
      activeTransfers,
      totalDownloads,
      totalStorageUsed: totalStorageUsed._sum.usedStorageBytes || 0,
      userCount,
    };
  }

  async delete(id: string) {
    await this.prisma.organization.delete({
      where: { id },
    });

    return { message: 'Organization deleted successfully' };
  }
}
