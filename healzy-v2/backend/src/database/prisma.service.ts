import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to PostgreSQL via Prisma');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDb() {
    if (process.env.NODE_ENV === 'production') throw new Error('Cannot clean production DB');
    const models = Reflect.ownKeys(this).filter((key) => key[0] !== '_');
    return Promise.all(models.map((model) => (this as any)[model]?.deleteMany?.()));
  }
}
