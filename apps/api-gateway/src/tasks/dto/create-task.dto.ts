import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '../enums/task.enums';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title',
    example: 'Implement authentication system',
    minLength: 3,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed task description',
    example: 'Implement JWT-based authentication with refresh tokens',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Task priority level',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
    default: TaskPriority.MEDIUM,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Task status',
    enum: TaskStatus,
    example: TaskStatus.TODO,
    default: TaskStatus.TODO,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Array of user IDs to assign the task',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assignedUserIds?: string[];

  @ApiPropertyOptional({
    description: 'Task due date in ISO 8601 format',
    example: '2025-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
