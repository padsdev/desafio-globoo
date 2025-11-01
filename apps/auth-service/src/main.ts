import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://admin:admin@rabbitmq:5672'], 
      queue: 'auth_queue', 
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  
  console.log('Auth microservice is listening 🚀');
}
bootstrap();