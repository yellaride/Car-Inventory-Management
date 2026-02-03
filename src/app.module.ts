import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CarsModule } from './cars/cars.module';
import { MediaModule } from './media/media.module';
import { RemarksModule } from './remarks/remarks.module';
import { SearchModule } from './search/search.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per minute
      },
    ]),
    PrismaModule,
    AuthModule,
    CarsModule,
    MediaModule,
    RemarksModule,
    SearchModule,
    HealthModule,
  ],
})
export class AppModule {}
