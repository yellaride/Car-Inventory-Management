import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    example: 'admin@gmail.com',
    description: 'Admin email address'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'password',
    description: 'Admin password'
  })
  @IsString()
  @MinLength(6)
  password: string;
}
