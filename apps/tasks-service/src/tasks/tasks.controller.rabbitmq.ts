import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  CreateCommentDto,
  FilterTasksDto,
} from './dto';

@Controller()
export class TasksControllerRabbitMQ {
  constructor(private readonly tasksService: TasksService) {}

  @MessagePattern('tasks.create')
  async create(@Payload() data: CreateTaskDto & { userId: string }) {
    const { userId, ...createTaskDto } = data;
    return this.tasksService.create(createTaskDto, userId);
  }

  @MessagePattern('tasks.findAll')
  async findAll(@Payload() data: FilterTasksDto) {
    return this.tasksService.findAll(data);
  }

  @MessagePattern('tasks.findOne')
  async findOne(@Payload() data: { id: string }) {
    return this.tasksService.findOne(data.id);
  }

  @MessagePattern('tasks.update')
  async update(@Payload() data: UpdateTaskDto & { id: string; userId: string }) {
    const { id, userId, ...updateTaskDto } = data;
    return this.tasksService.update(id, updateTaskDto, userId);
  }

  @MessagePattern('tasks.remove')
  async remove(@Payload() data: { id: string; userId: string }) {
    return this.tasksService.remove(data.id, data.userId);
  }

  @MessagePattern('tasks.comment.create')
  async createComment(@Payload() data: CreateCommentDto & { taskId: string; userId: string }) {
    const { taskId, userId, ...createCommentDto } = data;
    return this.tasksService.createComment(taskId, createCommentDto, userId);
  }

  @MessagePattern('tasks.comment.list')
  async getComments(@Payload() data: { taskId: string; page?: number; size?: number }) {
    return this.tasksService.getComments(data.taskId, data.page, data.size);
  }
}
