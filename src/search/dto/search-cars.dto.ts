import { IsOptional, IsString, IsInt, IsEnum, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CarCondition } from '@prisma/client';

export class SearchCarsDto {
  @ApiPropertyOptional({ 
    example: '1HGBH41JXMN109186',
    description: 'Search by VIN (partial or full)' 
  })
  @IsOptional()
  @IsString()
  vin?: string;

  @ApiPropertyOptional({ 
    example: 'Honda',
    description: 'Search by make' 
  })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({ 
    example: 'Accord',
    description: 'Search by model' 
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ 
    example: 2020,
    description: 'Filter by minimum year' 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  yearFrom?: number;

  @ApiPropertyOptional({ 
    example: 2024,
    description: 'Filter by maximum year' 
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(new Date().getFullYear() + 1)
  yearTo?: number;

  @ApiPropertyOptional({ 
    enum: CarCondition,
    description: 'Filter by condition' 
  })
  @IsOptional()
  @IsEnum(CarCondition)
  condition?: CarCondition;

  @ApiPropertyOptional({ 
    example: 'New York',
    description: 'Search by location' 
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ 
    example: 'Black',
    description: 'Search by color' 
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ 
    example: 'honda accord',
    description: 'General search query (searches across VIN, make, model)' 
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ 
    example: 1,
    description: 'Page number',
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ 
    example: 20,
    description: 'Items per page',
    default: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ 
    example: 'createdAt',
    description: 'Sort by field',
    enum: ['createdAt', 'updatedAt', 'year', 'make', 'model', 'condition']
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ 
    example: 'desc',
    description: 'Sort order',
    enum: ['asc', 'desc']
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
