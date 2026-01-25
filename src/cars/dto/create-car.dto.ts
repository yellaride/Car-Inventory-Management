import { IsString, IsInt, IsEnum, IsOptional, IsDateString, IsNumber, MinLength, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CarCondition } from '@prisma/client';

export class CreateCarDto {
  @ApiProperty({ 
    example: '1HGBH41JXMN109186',
    description: 'Vehicle Identification Number (17 characters)',
    minLength: 17,
    maxLength: 17
  })
  @IsString()
  @MinLength(17)
  @MaxLength(17)
  vin: string;

  @ApiProperty({ example: 'Honda', description: 'Car manufacturer' })
  @IsString()
  make: string;

  @ApiProperty({ example: 'Accord', description: 'Car model' })
  @IsString()
  model: string;

  @ApiProperty({ example: 2021, description: 'Manufacturing year' })
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @ApiPropertyOptional({ example: 'Black', description: 'Car color' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ 
    enum: CarCondition,
    example: CarCondition.POOR,
    description: 'Car condition status'
  })
  @IsEnum(CarCondition)
  condition: CarCondition;

  @ApiPropertyOptional({ example: 75000, description: 'Mileage in miles/km' })
  @IsOptional()
  @IsInt()
  @Min(0)
  mileage?: number;

  @ApiPropertyOptional({ example: 'New York', description: 'Current location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: '2024-01-15', description: 'Purchase date' })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({ example: 5000, description: 'Purchase price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @ApiPropertyOptional({ example: '/uploads/car-image.jpg', description: 'Cover image URL for listing' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ example: 'system', description: 'User who created the record' })
  @IsOptional()
  @IsString()
  createdBy?: string;
}
