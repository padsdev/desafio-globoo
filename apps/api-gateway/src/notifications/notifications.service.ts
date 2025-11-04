import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('NOTIFICATIONS_SERVICE') private readonly notificationsClient: ClientProxy,
  ) {}

  async getUnreadCount(userId: string) {
    return firstValueFrom(
      this.notificationsClient.send('notifications.unread-count', { userId })
    );
  }

  async getNotifications(userId: string) {
    return firstValueFrom(
      this.notificationsClient.send('notifications.list', { userId })
    );
  }
}
