import { Module } from '@nestjs/common';
import { CarsController } from './cars.controller';
import { CarsService } from './cars.service';
import { VinDecoderService } from './vin-decoder.service';

@Module({
  controllers: [CarsController],
  providers: [CarsService, VinDecoderService],
  exports: [CarsService],
})
export class CarsModule {}
