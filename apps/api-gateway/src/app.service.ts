import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      message: 'API Gateway is running',
      version: '1.0',
      endpoints: {
        api: '/api',
        documentation: '/api/docs',
        health: '/api/health',
      },
      services: {
        auth: '/api/auth',
        tasks: '/api/tasks',
      },
    };
  }
}
