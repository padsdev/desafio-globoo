import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksControllerRabbitMQ } from './tasks.controller.rabbitmq';
import { Task } from './task.entity';
import { Comment } from './comment.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Comment, User])],
  controllers: [TasksControllerRabbitMQ],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
