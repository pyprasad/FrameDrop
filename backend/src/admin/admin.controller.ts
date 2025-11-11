import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('admin')
@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  async getAuditLogs(
    @Query('limit') limit: string,
    @Query('offset') offset: string,
  ) {
    return this.adminService.getAuditLogs(
      parseInt(limit) || 100,
      parseInt(offset) || 0,
    );
  }

  @Get('health')
  @ApiOperation({ summary: 'Get system health status' })
  async getHealth() {
    return this.adminService.getSystemHealth();
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get platform analytics' })
  async getAnalytics(@Query('days') days: string) {
    return this.adminService.getAnalytics(parseInt(days) || 30);
  }
}
