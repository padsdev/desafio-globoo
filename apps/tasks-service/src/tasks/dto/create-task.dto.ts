import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsDateString,
  IsArray,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '../enums';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title',
    example: 'Implement user authentication',
    minLength: 3,
    maxLength: 200,
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(200, { message: 'Title must be at most 200 characters' })
  title: string;

  @ApiPropertyOptional({
    description: 'Task description',
    example: 'Implement JWT authentication with refresh tokens',
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Task priority level',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  @IsEnum(TaskPriority, { message: 'Invalid priority value' })
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Task status',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  @IsEnum(TaskStatus, { message: 'Invalid status value' })
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Task due date',
    example: '2025-12-31T23:59:59Z',
  })
  @IsDateString({}, { message: 'Due date must be a valid ISO 8601 date' })
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Array of user IDs to assign to this task',
    type: [String],
    example: ['123e4567-e89b-12d3-a456-426614174000'],
  })
  @IsArray({ message: 'Assigned user IDs must be an array' })
  @IsUUID('4', { each: true, message: 'Each assigned user ID must be a valid UUID' })
  @IsOptional()
  assignedUserIds?: string[];
}
