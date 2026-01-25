import { IsString, IsEnum, IsOptional, IsUUID, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaType } from '@prisma/client';

export class CreateMediaDto {
  @ApiProperty({ 
    example: 'cd5e8e5c-9b1a-4f3e-8a7b-1234567890ab',
    description: 'Car ID to attach media to' 
  })
  @IsUUID()
  carId: string;

  @ApiProperty({ 
    enum: MediaType,
    example: MediaType.IMAGE,
    description: 'Type of media'
  })
  @IsEnum(MediaType)
  type: MediaType;

  @ApiPropertyOptional({ 
    example: 'exterior',
    description: 'Media category (exterior, interior, engine, damage)'
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ 
    example: 'https://storage.example.com/car-media/abc123.jpg',
    description: 'Media URL'
  })
  @IsString()
  url: string;

  @ApiPropertyOptional({ 
    example: 'https://storage.example.com/car-media/abc123-thumb.jpg',
    description: 'Thumbnail URL'
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({ 
    example: 'car-damage-front.jpg',
    description: 'Original file name'
  })
  @IsString()
  fileName: string;

  @ApiProperty({ 
    example: 2048576,
    description: 'File size in bytes'
  })
  @IsInt()
  @Min(0)
  fileSize: number;

  @ApiProperty({ 
    example: 'image/jpeg',
    description: 'MIME type'
  })
  @IsString()
  mimeType: string;

  @ApiPropertyOptional({ 
    example: 120,
    description: 'Video duration in seconds'
  })
  @IsOptional()
  @IsInt()
  duration?: number;

  @ApiPropertyOptional({ 
    example: '1920x1080',
    description: 'Resolution'
  })
  @IsOptional()
  @IsString()
  resolution?: string;

  @ApiPropertyOptional({ 
    example: 'admin',
    description: 'User who uploaded the media'
  })
  @IsOptional()
  @IsString()
  uploadedBy?: string;
}
