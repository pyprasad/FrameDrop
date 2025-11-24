import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    // For testing purposes
    if (process.env.NODE_ENV === 'test') {
      const models = Reflect.ownKeys(this).filter(
        (key) => typeof key === 'string' && key[0] !== '_',
      );
      return Promise.all(models.map((modelKey) => this[modelKey].deleteMany()));
    }
  }
}
