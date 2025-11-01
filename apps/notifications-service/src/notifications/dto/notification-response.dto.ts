import { NotificationType } from '../enums/notification.enums';

export class NotificationResponseDto {
  id: string;
  type: NotificationType;
  message: string;
  metadata: Record<string, any> | null;
  read: boolean;
  userId: string;
  createdAt: Date;
}
