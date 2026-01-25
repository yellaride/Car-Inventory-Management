import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DecodeVinDto {
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
}
