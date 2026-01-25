import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      console.log('🔄 Attempting database connection...');
      await this.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      // Don't throw - let app start anyway for debugging
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;
    
    const models = Reflect.ownKeys(this).filter((key) => key[0] !== '_');
    
    return Promise.all(models.map((modelKey) => this[modelKey].deleteMany()));
  }
}
