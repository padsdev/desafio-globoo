import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { RpcExceptionFilterService } from './common/filters/rpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://admin:admin@rabbitmq:5672'], 
        queue: 'tasks_queue', 
        queueOptions: {
          durable: true,
        },
      },
    },
  );

  // Global exception filter
  app.useGlobalFilters(new RpcExceptionFilterService());

  // Global validation pipe for all endpoints
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.listen();

  console.log('🎧 Tasks microservice is listening on RabbitMQ (tasks_queue)');
}
bootstrap();
