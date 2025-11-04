import {
  Controller,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto';
import { LoginDto } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  async register(@Payload() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @MessagePattern('auth.login')
  async login(@Payload() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @MessagePattern('auth.refresh')
  async refresh(@Payload() data: { userId: number | string }) {
    return this.authService.refresh(String(data.userId));
  }

  @MessagePattern('auth.validate')
  async validate(@Payload() data: { userId: number | string }) {
    return {
      valid: true,
      user: data,
    };
  }
}
