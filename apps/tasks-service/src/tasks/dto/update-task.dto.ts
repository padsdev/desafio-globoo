import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsArray, IsUUID } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';
import { TaskPriority, TaskStatus } from '../enums';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({
    description: 'Task priority level',
    enum: TaskPriority,
  })
  @IsEnum(TaskPriority, { message: 'Invalid priority value' })
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Task status',
    enum: TaskStatus,
  })
  @IsEnum(TaskStatus, { message: 'Invalid status value' })
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Array of user IDs to assign to this task',
    type: [String],
  })
  @IsArray({ message: 'Assigned user IDs must be an array' })
  @IsUUID('4', { each: true, message: 'Each assigned user ID must be a valid UUID' })
  @IsOptional()
  assignedUserIds?: string[];
}
