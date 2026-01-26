import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    // Fixed admin credentials from environment
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPasswordHash = this.configService.get<string>('ADMIN_PASSWORD_HASH');

    // Check email
    if (email !== adminEmail) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, adminPasswordHash);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { email, sub: 'admin', role: 'admin' };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        email,
        role: 'admin',
      },
    };
  }

  async validateUser(email: string) {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    
    if (email === adminEmail) {
      return { email, role: 'admin' };
    }
    
    return null;
  }
}
