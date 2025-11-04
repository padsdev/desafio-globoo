import { apiClient } from './api-client';
import { Notification, PaginatedResponse } from '@/types';

export const notificationsService = {
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    read?: boolean;
  }): Promise<PaginatedResponse<Notification>> {
    const response = await apiClient.get<PaginatedResponse<Notification>>(
      '/notifications',
      { params }
    );
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<number>('/notifications/unread-count');
    return response.data;
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.patch<Notification>(
      `/notifications/${id}/read`
    );
    return response.data;
  },

  async markAllAsRead(): Promise<{ affected: number }> {
    const response = await apiClient.patch<{ affected: number }>(
      '/notifications/read-all'
    );
    return response.data;
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },
};
