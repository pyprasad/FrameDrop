import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../common/prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateTransferDto, UploadFileDto } from './dto/transfer.dto';
import { TransferStatus } from '@prisma/client';
import { customAlphabet } from 'nanoid';
import * as bcrypt from 'bcryptjs';
import * as dayjs from 'dayjs';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

@Injectable()
export class TransfersService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    @InjectQueue('transfers') private transfersQueue: Queue,
  ) {}

  async create(userId: string, dto: CreateTransferDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    // Generate unique short ID
    const shortId = nanoid();

    // Calculate expiry date
    const expiryDays = user.organization?.defaultTransferExpiryDays || 7;
    const expiresAt = dayjs().add(expiryDays, 'day').toDate();

    // Hash password if provided
    let hashedPassword = null;
    if (dto.password) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    }

    // Create transfer
    const transfer = await this.prisma.transfer.create({
      data: {
        shortId,
        userId,
        organizationId: user.organizationId,
        senderName: dto.senderName || `${user.firstName} ${user.lastName}`.trim(),
        senderEmail: dto.senderEmail || user.email,
        recipientEmails: dto.recipientEmails || [],
        message: dto.message,
        title: dto.title,
        password: hashedPassword,
        downloadLimit: dto.downloadLimit,
        expiresAt,
        status: TransferStatus.UPLOADING,
      },
      include: {
        files: true,
      },
    });

    // Log audit
    await this.createAuditLog('TRANSFER_CREATED', userId, transfer.id);

    return transfer;
  }

  async uploadFile(
    transferId: string,
    file: Express.Multer.File,
    userId?: string,
  ) {
    const transfer = await this.prisma.transfer.findUnique({
      where: { id: transferId },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    // Verify user owns this transfer
    if (userId && transfer.userId !== userId) {
      throw new ForbiddenException('You do not have permission to upload to this transfer');
    }

    // Generate unique S3 key
    const s3Key = this.storageService.generateFileKey(transferId, file.originalname);

    // Calculate hashes
    const md5Hash = this.storageService.calculateMD5(file.buffer);
    const sha256Hash = this.storageService.calculateSHA256(file.buffer);

    // Upload to S3/MinIO
    await this.storageService.uploadFile(s3Key, file.buffer, file.mimetype, {
      transferId,
      originalName: file.originalname,
    });

    // Create file record
    const transferFile = await this.prisma.transferFile.create({
      data: {
        transferId,
        filename: file.originalname,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        s3Key,
        s3Bucket: process.env.S3_BUCKET || 'framedrop',
        md5Hash,
        sha256Hash,
        uploadComplete: true,
      },
    });

    // Update transfer total size
    await this.prisma.transfer.update({
      where: { id: transferId },
      data: {
        totalSizeBytes: {
          increment: file.size,
        },
      },
    });

    // Update user storage usage
    if (userId) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          usedStorageBytes: {
            increment: file.size,
          },
          transferCount: {
            increment: 1,
          },
        },
      });
    }

    await this.createAuditLog('FILE_UPLOADED', userId, transferId);

    return transferFile;
  }

  async finalizeTransfer(transferId: string, userId?: string) {
    const transfer = await this.prisma.transfer.findUnique({
      where: { id: transferId },
      include: { files: true },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    if (userId && transfer.userId !== userId) {
      throw new ForbiddenException('You do not have permission to finalize this transfer');
    }

    // Update status to active
    const updatedTransfer = await this.prisma.transfer.update({
      where: { id: transferId },
      data: {
        status: TransferStatus.ACTIVE,
      },
      include: {
        files: true,
      },
    });

    // Send email notifications
    if (transfer.recipientEmails && transfer.recipientEmails.length > 0) {
      await this.transfersQueue.add('send-transfer-notification', {
        transferId: transfer.id,
        recipientEmails: transfer.recipientEmails,
      });
    }

    return updatedTransfer;
  }

  async getTransfer(shortId: string, password?: string) {
    const transfer = await this.prisma.transfer.findUnique({
      where: { shortId },
      include: {
        files: true,
        downloads: true,
      },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    // Check if expired
    if (transfer.expiresAt < new Date()) {
      throw new ForbiddenException('This transfer has expired');
    }

    // Check password if required
    if (transfer.password) {
      if (!password) {
        throw new ForbiddenException('Password required');
      }

      const isValid = await bcrypt.compare(password, transfer.password);
      if (!isValid) {
        throw new ForbiddenException('Invalid password');
      }
    }

    // Check download limit
    if (transfer.downloadLimit && transfer.downloadCount >= transfer.downloadLimit) {
      throw new ForbiddenException('Download limit reached');
    }

    return transfer;
  }

  async downloadTransfer(shortId: string, userId?: string, ipAddress?: string) {
    const transfer = await this.getTransfer(shortId);

    // Generate download URLs for all files
    const downloadUrls = await Promise.all(
      transfer.files.map(async (file) => ({
        fileId: file.id,
        filename: file.filename,
        url: await this.storageService.getDownloadUrl(file.s3Key, 3600, file.filename),
        sizeBytes: file.sizeBytes,
      })),
    );

    // Increment download count
    await this.prisma.transfer.update({
      where: { id: transfer.id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    // Create download record
    await this.prisma.download.create({
      data: {
        transferId: transfer.id,
        userId,
        ipAddress,
        filesDownloaded: transfer.files.map((f) => f.id),
      },
    });

    await this.createAuditLog('TRANSFER_DOWNLOADED', userId, transfer.id);

    return downloadUrls;
  }

  async deleteTransfer(id: string, userId: string) {
    const transfer = await this.prisma.transfer.findUnique({
      where: { id },
      include: { files: true },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    if (transfer.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this transfer');
    }

    // Delete files from storage
    const fileKeys = transfer.files.map((f) => f.s3Key);
    await this.storageService.deleteFiles(fileKeys);

    // Update user storage usage
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        usedStorageBytes: {
          decrement: transfer.totalSizeBytes,
        },
      },
    });

    // Delete transfer (cascade will delete files and downloads)
    await this.prisma.transfer.delete({
      where: { id },
    });

    await this.createAuditLog('TRANSFER_DELETED', userId, id);

    return { message: 'Transfer deleted successfully' };
  }

  async getTransferAnalytics(transferId: string, userId: string) {
    const transfer = await this.prisma.transfer.findUnique({
      where: { id: transferId },
      include: {
        downloads: {
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    if (transfer.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this analytics');
    }

    return {
      transfer: {
        id: transfer.id,
        shortId: transfer.shortId,
        title: transfer.title,
        totalSizeBytes: transfer.totalSizeBytes,
        createdAt: transfer.createdAt,
        expiresAt: transfer.expiresAt,
      },
      downloads: transfer.downloads,
      downloadCount: transfer.downloadCount,
    };
  }

  private async createAuditLog(action: string, userId: string, transferId?: string) {
    try {
      await this.prisma.auditLog.create({
        data: {
          action: action as any,
          userId,
          transferId,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }
}
