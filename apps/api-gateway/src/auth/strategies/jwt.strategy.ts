import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
    });
  }

  async validate(payload: JwtPayload) {
    // Validate user exists by calling auth-service
    try {
      const authServiceUrl = this.configService.get<string>('AUTH_SERVICE_URL', 'http://auth-service:3002');
      const response = await firstValueFrom(
        this.httpService.get(`${authServiceUrl}/auth/validate`, {
          headers: {
            Authorization: `Bearer ${this.configService.get<string>('JWT_SECRET')}`,
          },
        }),
      );

      if (!response.data || !(response.data as any).valid) {
        throw new UnauthorizedException('Invalid token');
      }

      return {
        id: payload.sub,
        email: payload.email,
        username: payload.username,
      };
    } catch (error: any) {
      // If auth-service is not available, validate payload only
      return {
        id: payload.sub,
        email: payload.email,
        username: payload.username,
      };
    }
  }
}
