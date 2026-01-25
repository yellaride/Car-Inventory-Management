import { PartialType } from '@nestjs/swagger';
import { CreateCarDto } from './create-car.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCarDto extends PartialType(CreateCarDto) {
  @ApiPropertyOptional({ example: 'admin', description: 'User who modified the record' })
  @IsOptional()
  @IsString()
  lastModifiedBy?: string;
}
