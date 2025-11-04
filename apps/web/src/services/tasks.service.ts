import { apiClient } from './api-client';
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskFilters,
  PaginatedResponse,
  Comment,
  CreateCommentDto,
} from '@/types';

export const tasksService = {
  async getTasks(filters?: TaskFilters): Promise<PaginatedResponse<Task>> {
    const response = await apiClient.get<PaginatedResponse<Task>>('/tasks', {
      params: filters,
    });
    return response.data;
  },

  async getTask(id: string): Promise<Task> {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  async createTask(data: CreateTaskDto): Promise<Task> {
    const response = await apiClient.post<Task>('/tasks', data);
    return response.data;
  },

  async updateTask(id: string, data: UpdateTaskDto): Promise<Task> {
    const response = await apiClient.patch<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },

  async getComments(taskId: string): Promise<Comment[]> {
    const response = await apiClient.get<Comment[]>(`/tasks/${taskId}/comments`);
    return response.data;
  },

  async createComment(taskId: string, data: CreateCommentDto): Promise<Comment> {
    const response = await apiClient.post<Comment>(`/tasks/${taskId}/comments`, data);
    return response.data;
  },
};
