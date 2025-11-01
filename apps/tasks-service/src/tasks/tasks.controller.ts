import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  CreateCommentDto,
  FilterTasksDto,
  TaskResponseDto,
  CommentResponseDto,
  PaginatedResponseDto,
} from './dto';

// Note: JWT Guard should be implemented and imported from api-gateway
// For now, we'll create a placeholder decorator
const CurrentUser = () => {
  return (target: any, propertyKey: string, parameterIndex: number) => {
    // Placeholder for CurrentUser decorator
  };
};

@ApiTags('Tasks')
@Controller('tasks')
// @UseGuards(JwtAuthGuard) // Add when guard is implemented
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new task',
    description: 'Creates a new task and returns it',
  })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid data or assigned users not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    // @CurrentUser() user: { id: string },
  ) {
    // TODO: Get user ID from JWT token
    const userId = 'temp-user-id'; // Placeholder
    return this.tasksService.create(createTaskDto, userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all tasks',
    description: 'Returns paginated list of tasks with optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'size', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] })
  @ApiQuery({ name: 'priority', required: false, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] })
  @ApiQuery({ name: 'assignedUserId', required: false, type: String })
  @ApiQuery({ name: 'authorId', required: false, type: String })
  async findAll(@Query() filters: FilterTasksDto) {
    return this.tasksService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get task by ID',
    description: 'Returns a single task with all details',
  })
  @ApiResponse({
    status: 200,
    description: 'Task retrieved successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a task',
    description: 'Updates a task. Only the author can update their tasks.',
  })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - you can only update your own tasks',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    // @CurrentUser() user: { id: string },
  ) {
    // TODO: Get user ID from JWT token
    const userId = 'temp-user-id'; // Placeholder
    return this.tasksService.update(id, updateTaskDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a task',
    description: 'Deletes a task. Only the author can delete their tasks.',
  })
  @ApiResponse({
    status: 204,
    description: 'Task deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - you can only delete your own tasks',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  async remove(
    @Param('id') id: string,
    // @CurrentUser() user: { id: string },
  ) {
    // TODO: Get user ID from JWT token
    const userId = 'temp-user-id'; // Placeholder
    await this.tasksService.remove(id, userId);
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a comment on a task',
    description: 'Adds a new comment to the specified task',
  })
  @ApiResponse({
    status: 201,
    description: 'Comment created successfully',
    type: CommentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  async createComment(
    @Param('id') taskId: string,
    @Body() createCommentDto: CreateCommentDto,
    // @CurrentUser() user: { id: string },
  ) {
    // TODO: Get user ID from JWT token
    const userId = 'temp-user-id'; // Placeholder
    return this.tasksService.createComment(taskId, createCommentDto, userId);
  }

  @Get(':id/comments')
  @ApiOperation({
    summary: 'Get comments for a task',
    description: 'Returns paginated list of comments for the specified task',
  })
  @ApiResponse({
    status: 200,
    description: 'Comments retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Task not found',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'size', required: false, type: Number, example: 10 })
  async getComments(
    @Param('id') taskId: string,
    @Query('page') page?: number,
    @Query('size') size?: number,
  ) {
    return this.tasksService.getComments(taskId, page, size);
  }
}
