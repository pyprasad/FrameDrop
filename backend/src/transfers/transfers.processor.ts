import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../common/prisma/prisma.service';
import { EmailService } from '../email/email.service';

@Processor('transfers')
export class TransfersProcessor {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  @Process('send-transfer-notification')
  async handleTransferNotification(job: Job) {
    const { transferId, recipientEmails } = job.data;

    const transfer = await this.prisma.transfer.findUnique({
      where: { id: transferId },
      include: {
        files: true,
        user: true,
      },
    });

    if (!transfer) {
      console.error('Transfer not found:', transferId);
      return;
    }

    // Send email to each recipient
    for (const email of recipientEmails) {
      try {
        await this.emailService.sendTransferNotification({
          to: email,
          senderName: transfer.senderName || transfer.user?.email,
          message: transfer.message,
          transferUrl: `${process.env.FRONTEND_URL}/download/${transfer.shortId}`,
          fileCount: transfer.files.length,
          totalSize: transfer.totalSizeBytes,
          expiresAt: transfer.expiresAt,
        });
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
      }
    }
  }

  @Process('expire-transfers')
  async handleExpireTransfers(job: Job) {
    const expiredTransfers = await this.prisma.transfer.findMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
        status: 'ACTIVE',
      },
    });

    for (const transfer of expiredTransfers) {
      await this.prisma.transfer.update({
        where: { id: transfer.id },
        data: {
          status: 'EXPIRED',
        },
      });

      // Optionally delete files after expiry
      // await this.storageService.deleteFiles(transfer.files.map(f => f.s3Key));
    }

    console.log(`Expired ${expiredTransfers.length} transfers`);
  }
}
