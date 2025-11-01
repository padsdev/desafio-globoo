import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/user.service';
import { CreateUserDto } from '../users/dto';
import { LoginDto, AuthResponseDto } from './dto';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Registra um novo usuário
   */
  async register(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    // Cria o usuário (validações são feitas no UsersService)
    const user = await this.usersService.create(createUserDto);

    // Gera os tokens
    return this.generateTokens(user);
  }

  /**
   * Autentica um usuário
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Busca o usuário pelo email
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Valida a senha
    const isPasswordValid = await this.usersService.validatePassword(
      user,
      loginDto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gera os tokens
    return this.generateTokens(user);
  }

  /**
   * Renova os tokens usando um refresh token válido
   */
  async refresh(userId: string): Promise<AuthResponseDto> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return this.generateTokens(user);
  }

  /**
   * Gera access token e refresh token para um usuário
   */
  private async generateTokens(user: User): Promise<AuthResponseDto> {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const refreshPayload = {
      ...payload,
      type: 'refresh',
    };

    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const jwtExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '15m');
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const jwtRefreshExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload as any, {
        secret: jwtSecret,
        expiresIn: jwtExpiresIn as any,
      }),
      this.jwtService.signAsync(refreshPayload as any, {
        secret: jwtRefreshSecret,
        expiresIn: jwtRefreshExpiresIn as any,
      }),
    ]);

    // Calcula o tempo de expiração em segundos
    const expiresIn = this.parseExpirationTime(jwtExpiresIn);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    };
  }

  /**
   * Converte string de tempo (ex: '15m', '7d') para segundos
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
        return 900; // 15 minutos por padrão
    }
  }

  /**
   * Valida um access token (útil para outros serviços)
   */
  async validateToken(token: string): Promise<any> {
    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET');
      return await this.jwtService.verifyAsync(token, {
        secret: jwtSecret,
      });
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
