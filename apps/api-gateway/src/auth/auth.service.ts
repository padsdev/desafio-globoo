import { Injectable, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto';

@Injectable()
export class AuthService {
  private readonly authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL', 'http://auth-service:3002');
  }

  /**
   * Handles HTTP errors from auth-service
   */
  private handleHttpError(error: any) {
    if (error.response) {
      throw new HttpException(
        error.response.data?.message || 'Error from authentication service',
        error.response.status || HttpStatus.BAD_REQUEST,
      );
    }
    throw new HttpException(
      'Authentication service unavailable',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  /**
   * Register a new user via auth-service
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/register`, registerDto),
      );
      return response.data;
    } catch (error: any) {
      this.handleHttpError(error);
      throw error; // TypeScript requires this
    }
  }

  /**
   * Login user via auth-service
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/auth/login`, loginDto),
      );
      return response.data;
    } catch (error: any) {
      this.handleHttpError(error);
      throw error; // TypeScript requires this
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    try {
      // Verify refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Generate new tokens
      const newPayload = {
        sub: payload.sub,
        email: payload.email,
        username: payload.username,
      };

      const refreshPayload = {
        ...newPayload,
        type: 'refresh',
      };

      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      const jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '15m');
      const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
      const jwtRefreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');

      const [accessToken, newRefreshToken] = await Promise.all([
        this.jwtService.signAsync(newPayload as any, {
          secret: jwtSecret,
          expiresIn: jwtExpiresIn as any,
        }),
        this.jwtService.signAsync(refreshPayload as any, {
          secret: jwtRefreshSecret,
          expiresIn: jwtRefreshExpiresIn as any,
        }),
      ]);

      const expiresIn = this.parseExpirationTime(jwtExpiresIn);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        tokenType: 'Bearer',
        expiresIn,
        user: {
          id: payload.sub,
          email: payload.email,
          username: payload.username,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Parse expiration time string (e.g., '15m', '7d') to seconds
   */
  private parseExpirationTime(time: string): number {
    const unit = time.slice(-1);
    const value = parseInt(time.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 900; // 15 minutes default
    }
  }
}