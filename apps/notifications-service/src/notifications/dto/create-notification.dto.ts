import { IsString, IsNotEmpty, IsEnum, IsUUID, IsOptional, IsObject } from 'class-validator';
import { NotificationType } from '../enums/notification.enums';

export class CreateNotificationDto {
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
