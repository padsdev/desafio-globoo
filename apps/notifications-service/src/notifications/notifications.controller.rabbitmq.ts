import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsControllerRabbitMQ {
  constructor(private readonly notificationsService: NotificationsService) {}

  @MessagePattern('notifications.unread-count')
  async getUnreadCount(@Payload() data: { userId: string }) {
    const count = await this.notificationsService.getUnreadCount(data.userId);
    return { count };
  }

  @MessagePattern('notifications.list')
  async getNotifications(@Payload() data: { userId: string; page?: number; limit?: number }) {
    return this.notificationsService.findAllByUser(data.userId, {
      page: data.page || 1,
      limit: data.limit || 20,
    });
  }
}
