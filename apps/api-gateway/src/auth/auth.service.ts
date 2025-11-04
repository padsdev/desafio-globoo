import { Injectable, Inject, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, catchError, throwError } from 'rxjs';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new user via auth-service
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    return firstValueFrom(
      this.authClient.send('auth.register', registerDto).pipe(
        catchError((error) => {
          throw this.handleRpcError(error);
        })
      )
    );
  }

  /**
   * Login user via auth-service
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    return firstValueFrom(
      this.authClient.send('auth.login', loginDto).pipe(
        catchError((error) => {
          throw this.handleRpcError(error);
        })
      )
    );
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

      // Request refresh from auth service
      return firstValueFrom(
        this.authClient.send('auth.refresh', { userId: payload.sub }).pipe(
          catchError((error) => {
            throw this.handleRpcError(error);
          })
        )
      );
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Handle RPC errors and convert to HTTP exceptions
   */
  private handleRpcError(error: any): HttpException {
    if (typeof error === 'object' && error.statusCode) {
      throw new HttpException(
        {
          statusCode: error.statusCode,
          error: error.error || 'Error',
          message: error.message || 'An error occurred',
        },
        error.statusCode
      );
    }
    
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred',
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
