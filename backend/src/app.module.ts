import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransfersModule } from './transfers/transfers.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { StorageModule } from './storage/storage.module';
import { EmailModule } from './email/email.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Bull Queue (Redis)
    BullModule.forRootAsync({
      useFactory: () => ({
        redis: {
          host: process.env.REDIS_URL?.split('://')[1]?.split(':')[0] || 'localhost',
          port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379'),
        },
      }),
    }),

    // Application modules
    PrismaModule,
    AuthModule,
    UsersModule,
    TransfersModule,
    OrganizationsModule,
    StorageModule,
    EmailModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
