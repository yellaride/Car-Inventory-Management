import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateRemarkDto } from './create-remark.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRemarkDto extends PartialType(
  OmitType(CreateRemarkDto, ['carId', 'createdBy'] as const)
) {
  @ApiPropertyOptional({ 
    example: 'admin',
    description: 'User who updated the remark'
  })
  @IsOptional()
  @IsString()
  updatedBy?: string;
}
