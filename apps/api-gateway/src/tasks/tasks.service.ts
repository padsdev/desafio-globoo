import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, catchError } from 'rxjs';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryParamsDto } from './dto/query-params.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class TasksService {
  constructor(
    @Inject('TASKS_SERVICE') private readonly tasksClient: ClientProxy,
  ) {}

  /**
   * Create a new task
   */
  async create(createTaskDto: CreateTaskDto, userId: string) {
    return firstValueFrom(
      this.tasksClient.send('tasks.create', { ...createTaskDto, userId }).pipe(
        catchError((error) => {
          throw this.handleRpcError(error);
        })
      )
    );
  }

  /**
   * Get all tasks with optional filters and pagination
   */
  async findAll(queryParams: QueryParamsDto, userId: string) {
    return firstValueFrom(
      this.tasksClient.send('tasks.findAll', { ...queryParams, userId }).pipe(
        catchError((error) => {
          throw this.handleRpcError(error);
        })
      )
    );
  }

  /**
   * Get a single task by ID
   */
  async findOne(id: string, userId: string) {
    return firstValueFrom(
      this.tasksClient.send('tasks.findOne', { id, userId }).pipe(
        catchError((error) => {
          throw this.handleRpcError(error);
        })
      )
    );
  }

  /**
   * Update a task by ID
   */
  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    return firstValueFrom(
      this.tasksClient.send('tasks.update', { id, ...updateTaskDto, userId }).pipe(
        catchError((error) => {
          throw this.handleRpcError(error);
        })
      )
    );
  }

  /**
   * Delete a task by ID
   */
  async remove(id: string, userId: string) {
    return firstValueFrom(
      this.tasksClient.send('tasks.remove', { id, userId }).pipe(
        catchError((error) => {
          throw this.handleRpcError(error);
        })
      )
    );
  }

  /**
   * Create a comment on a task
   */
  async createComment(taskId: string, createCommentDto: CreateCommentDto, userId: string) {
    return firstValueFrom(
      this.tasksClient.send('tasks.comment.create', { taskId, ...createCommentDto, userId }).pipe(
        catchError((error) => {
          throw this.handleRpcError(error);
        })
      )
    );
  }

  /**
   * Get all comments for a task
   */
  async getComments(taskId: string, userId: string) {
    return firstValueFrom(
      this.tasksClient.send('tasks.comment.list', { taskId, userId }).pipe(
        catchError((error) => {
          throw this.handleRpcError(error);
        })
      )
    );
  }

  /**
   * Handle RPC errors and convert to HTTP exceptions
   */
  private handleRpcError(error: any): HttpException {
    if (typeof error === 'object' && error.statusCode) {
      throw new HttpException(
        {
          statusCode: error.statusCode,
          error: error.error || 'Error',
          message: error.message || 'An error occurred',
        },
        error.statusCode
      );
    }
    
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred',
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
