import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Request } from 'express';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/transfer.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('transfers')
@Controller('transfers')
export class TransfersController {
  constructor(private transfersService: TransfersService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new transfer' })
  async create(@CurrentUser() user: any, @Body() dto: CreateTransferDto) {
    return this.transfersService.create(user.id, dto);
  }

  @Post(':id/upload')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a file to transfer' })
  async uploadFile(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.transfersService.uploadFile(id, file, user.id);
  }

  @Post(':id/finalize')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Finalize transfer and send notifications' })
  async finalize(@Param('id') id: string, @CurrentUser() user: any) {
    return this.transfersService.finalizeTransfer(id, user.id);
  }

  @Public()
  @Get(':shortId')
  @ApiOperation({ summary: 'Get transfer by short ID' })
  async getTransfer(
    @Param('shortId') shortId: string,
    @Query('password') password?: string,
  ) {
    return this.transfersService.getTransfer(shortId, password);
  }

  @Public()
  @Post(':shortId/download')
  @ApiOperation({ summary: 'Download transfer files' })
  async download(
    @Param('shortId') shortId: string,
    @Query('password') password: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    return this.transfersService.downloadTransfer(shortId, null, ipAddress);
  }

  @Get(':id/analytics')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transfer analytics' })
  async getAnalytics(@Param('id') id: string, @CurrentUser() user: any) {
    return this.transfersService.getTransferAnalytics(id, user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete transfer' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.transfersService.deleteTransfer(id, user.id);
  }
}
