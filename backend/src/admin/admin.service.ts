import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalOrganizations,
      totalTransfers,
      activeTransfers,
      totalDownloads,
      totalStorage,
      recentTransfers,
      topUsers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.organization.count(),
      this.prisma.transfer.count(),
      this.prisma.transfer.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.download.count(),
      this.prisma.user.aggregate({
        _sum: {
          usedStorageBytes: true,
        },
      }),
      this.prisma.transfer.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              files: true,
              downloads: true,
            },
          },
        },
      }),
      this.prisma.user.findMany({
        take: 10,
        orderBy: { transferCount: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          transferCount: true,
          usedStorageBytes: true,
        },
      }),
    ]);

    return {
      totalUsers,
      totalOrganizations,
      totalTransfers,
      activeTransfers,
      totalDownloads,
      totalStorage: totalStorage._sum.usedStorageBytes || 0,
      recentTransfers,
      topUsers,
    };
  }

  async getAuditLogs(limit = 100, offset = 0) {
    return this.prisma.auditLog.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getSystemHealth() {
    const dbHealth = await this.checkDatabaseHealth();
    const storageHealth = await this.checkStorageHealth();

    return {
      status: dbHealth && storageHealth ? 'healthy' : 'degraded',
      database: dbHealth ? 'connected' : 'disconnected',
      storage: storageHealth ? 'available' : 'unavailable',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }

  private async checkStorageHealth(): Promise<boolean> {
    // TODO: Implement S3/MinIO health check
    return true;
  }

  async getAnalytics(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [transfersByDay, downloadsByDay, usersByDay] = await Promise.all([
      this.getTransfersByDay(startDate),
      this.getDownloadsByDay(startDate),
      this.getUsersByDay(startDate),
    ]);

    return {
      transfersByDay,
      downloadsByDay,
      usersByDay,
    };
  }

  private async getTransfersByDay(startDate: Date) {
    return this.prisma.$queryRaw`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM "Transfer"
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
  }

  private async getDownloadsByDay(startDate: Date) {
    return this.prisma.$queryRaw`
      SELECT
        DATE(completed_at) as date,
        COUNT(*) as count
      FROM "Download"
      WHERE completed_at >= ${startDate}
      GROUP BY DATE(completed_at)
      ORDER BY date ASC
    `;
  }

  private async getUsersByDay(startDate: Date) {
    return this.prisma.$queryRaw`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM "User"
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
  }
}
