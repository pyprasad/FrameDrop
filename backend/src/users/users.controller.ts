import { Controller, Get, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/user.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }

  @Get('me/transfers')
  @ApiOperation({ summary: 'Get transfer history' })
  async getTransferHistory(@CurrentUser() user: any) {
    return this.usersService.getTransferHistory(user.id);
  }

  @Get('me/storage')
  @ApiOperation({ summary: 'Get storage usage' })
  async getStorageUsage(@CurrentUser() user: any) {
    return this.usersService.getStorageUsage(user.id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get user by ID (Admin only)' })
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete user (Super Admin only)' })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
