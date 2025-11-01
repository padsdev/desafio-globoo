import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryParamsDto } from './dto/query-params.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class TasksService {
  private readonly tasksServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.tasksServiceUrl = this.configService.get<string>('TASKS_SERVICE_URL') || 'http://localhost:3003';
  }

  /**
   * Create a new task
   */
  async create(createTaskDto: CreateTaskDto, userId: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.tasksServiceUrl}/tasks`, createTaskDto, {
          headers: { 'x-user-id': userId },
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new HttpException(
              error.response?.data || 'Error creating task',
              error.response?.status || 500,
            );
          }),
        ),
    );

    return data;
  }

  /**
   * Get all tasks with optional filters and pagination
   */
  async findAll(queryParams: QueryParamsDto, userId: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .get(`${this.tasksServiceUrl}/tasks`, {
          params: queryParams,
          headers: { 'x-user-id': userId },
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new HttpException(
              error.response?.data || 'Error fetching tasks',
              error.response?.status || 500,
            );
          }),
        ),
    );

    return data;
  }

  /**
   * Get a single task by ID
   */
  async findOne(id: string, userId: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .get(`${this.tasksServiceUrl}/tasks/${id}`, {
          headers: { 'x-user-id': userId },
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new HttpException(
              error.response?.data || 'Error fetching task',
              error.response?.status || 500,
            );
          }),
        ),
    );

    return data;
  }

  /**
   * Update a task by ID
   */
  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .patch(`${this.tasksServiceUrl}/tasks/${id}`, updateTaskDto, {
          headers: { 'x-user-id': userId },
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new HttpException(
              error.response?.data || 'Error updating task',
              error.response?.status || 500,
            );
          }),
        ),
    );

    return data;
  }

  /**
   * Delete a task by ID
   */
  async remove(id: string, userId: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .delete(`${this.tasksServiceUrl}/tasks/${id}`, {
          headers: { 'x-user-id': userId },
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new HttpException(
              error.response?.data || 'Error deleting task',
              error.response?.status || 500,
            );
          }),
        ),
    );

    return data;
  }

  /**
   * Create a comment on a task
   */
  async createComment(taskId: string, createCommentDto: CreateCommentDto, userId: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .post(`${this.tasksServiceUrl}/tasks/${taskId}/comments`, createCommentDto, {
          headers: { 'x-user-id': userId },
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new HttpException(
              error.response?.data || 'Error creating comment',
              error.response?.status || 500,
            );
          }),
        ),
    );

    return data;
  }

  /**
   * Get all comments for a task
   */
  async getComments(taskId: string, userId: string) {
    const { data } = await firstValueFrom(
      this.httpService
        .get(`${this.tasksServiceUrl}/tasks/${taskId}/comments`, {
          headers: { 'x-user-id': userId },
        })
        .pipe(
          catchError((error: AxiosError) => {
            throw new HttpException(
              error.response?.data || 'Error fetching comments',
              error.response?.status || 500,
            );
          }),
        ),
    );

    return data;
  }
}
