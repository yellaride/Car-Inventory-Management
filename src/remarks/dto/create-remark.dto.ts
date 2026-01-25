import { IsString, IsEnum, IsOptional, IsUUID, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RemarkType, Priority } from '@prisma/client';

export class CreateRemarkDto {
  @ApiProperty({ 
    example: 'cd5e8e5c-9b1a-4f3e-8a7b-1234567890ab',
    description: 'Car ID to add remark to' 
  })
  @IsUUID()
  carId: string;

  @ApiProperty({ 
    example: 'Front bumper is severely damaged. Needs complete replacement.',
    description: 'Remark text content',
    minLength: 1
  })
  @IsString()
  @MinLength(1)
  text: string;

  @ApiPropertyOptional({ 
    enum: RemarkType,
    example: RemarkType.INSPECTION,
    description: 'Type of remark'
  })
  @IsOptional()
  @IsEnum(RemarkType)
  type?: RemarkType;

  @ApiPropertyOptional({ 
    enum: Priority,
    example: Priority.HIGH,
    description: 'Priority level'
  })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @ApiPropertyOptional({ 
    example: 'admin',
    description: 'User who created the remark'
  })
  @IsOptional()
  @IsString()
  createdBy?: string;
}
