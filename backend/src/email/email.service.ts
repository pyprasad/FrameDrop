import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: parseInt(this.configService.get('SMTP_PORT') || '587'),
      secure: this.configService.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });
  }

  async sendTransferNotification(data: {
    to: string;
    senderName: string;
    message?: string;
    transferUrl: string;
    fileCount: number;
    totalSize: number;
    expiresAt: Date;
  }) {
    const template = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { background: #f9fafb; padding: 30px; }
    .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none;
              border-radius: 6px; display: inline-block; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 FrameDrop</h1>
    </div>
    <div class="content">
      <h2>{{senderName}} sent you files</h2>
      {{#if message}}
        <p><strong>Message:</strong> {{message}}</p>
      {{/if}}
      <p><strong>Files:</strong> {{fileCount}} file(s) ({{totalSizeFormatted}})</p>
      <p><strong>Expires:</strong> {{expiresAt}}</p>
      <a href="{{transferUrl}}" class="button">Download Files</a>
      <p style="color: #666; font-size: 14px;">
        Or copy this link: <br/>
        <a href="{{transferUrl}}">{{transferUrl}}</a>
      </p>
    </div>
    <div class="footer">
      <p>This transfer will expire on {{expiresAt}}</p>
      <p>Powered by FrameDrop - Enterprise File Transfer</p>
    </div>
  </div>
</body>
</html>
    `;

    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate({
      ...data,
      totalSizeFormatted: this.formatBytes(data.totalSize),
      expiresAt: data.expiresAt.toLocaleDateString(),
    });

    await this.transporter.sendMail({
      from: this.configService.get('SMTP_FROM') || 'noreply@framedrop.com',
      to: data.to,
      subject: `${data.senderName} sent you ${data.fileCount} file(s)`,
      html,
    });
  }

  async sendWelcomeEmail(to: string, name: string) {
    const html = `
      <h1>Welcome to FrameDrop!</h1>
      <p>Hi ${name},</p>
      <p>Thank you for joining FrameDrop. You can now send large files securely and easily.</p>
      <p>Get started by creating your first transfer!</p>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('SMTP_FROM'),
      to,
      subject: 'Welcome to FrameDrop',
      html,
    });
  }

  async sendPasswordResetEmail(to: string, resetToken: string) {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    const html = `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await this.transporter.sendMail({
      from: this.configService.get('SMTP_FROM'),
      to,
      subject: 'Reset Your Password',
      html,
    });
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
