import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from '@prisma/client';

export class GenerateUploadUrlDto {
  @ApiProperty({ 
    example: 'cd5e8e5c-9b1a-4f3e-8a7b-1234567890ab',
    description: 'Car ID to attach media to' 
  })
  @IsUUID()
  carId: string;

  @ApiProperty({ 
    enum: MediaType,
    example: MediaType.VIDEO,
    description: 'Type of media to upload'
  })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiProperty({ 
    example: 'car-damage-video.mp4',
    description: 'Original file name'
  })
  @IsString()
  fileName: string;

  @ApiPropertyOptional({ 
    example: 'exterior',
    description: 'Media category'
  })
  @IsOptional()
  @IsString()
  category?: string;
}
