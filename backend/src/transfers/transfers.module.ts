import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';
import { StorageModule } from '../storage/storage.module';
import { EmailModule } from '../email/email.module';
import { TransfersProcessor } from './transfers.processor';

@Module({
  imports: [
    StorageModule,
    EmailModule,
    BullModule.registerQueue({
      name: 'transfers',
    }),
  ],
  controllers: [TransfersController],
  providers: [TransfersService, TransfersProcessor],
  exports: [TransfersService],
})
export class TransfersModule {}
