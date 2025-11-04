import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { RpcExceptionFilterService } from './common/filters/rpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://admin:admin@rabbitmq:5672'], 
        queue: 'auth_queue', 
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  // Global exception filter
  app.useGlobalFilters(new RpcExceptionFilterService());

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen();
  
  console.log('🎧 Auth microservice is listening on RabbitMQ (auth_queue)');
}
bootstrap();