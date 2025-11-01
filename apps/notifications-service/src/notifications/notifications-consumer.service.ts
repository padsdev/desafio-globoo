import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqplib from 'amqplib';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';

/**
 * RabbitMQ Consumer for processing notification events
 * Listens to the notifications queue and creates notifications
 */
@Injectable()
export class NotificationsConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsConsumerService.name);
  private connection: amqplib.Connection | null = null;
  private channel: amqplib.Channel | null = null;
  private readonly queueName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {
    this.queueName = this.configService.get<string>('RABBITMQ_QUEUE') || 'notifications_queue';
  }

  /**
   * Initialize RabbitMQ connection and start consuming
   */
  async onModuleInit() {
    await this.connect();
    await this.consume();
  }

  /**
   * Connect to RabbitMQ
   */
  private async connect() {
    try {
      const rabbitmqUrl = this.configService.get<string>('RABBITMQ_URL');
      
      if (!rabbitmqUrl) {
        throw new Error('RABBITMQ_URL is not defined');
      }

      this.connection = (await amqplib.connect(rabbitmqUrl)) as any;
      this.channel = await (this.connection as any).createChannel();
      
      // Assert queue exists
      await this.channel!.assertQueue(this.queueName, {
        durable: true,
      });

      this.logger.log(`Connected to RabbitMQ and listening on queue: ${this.queueName}`);

      // Handle connection errors
      this.connection!.on('error', (err: any) => {
        this.logger.error('RabbitMQ connection error:', err);
      });

      this.connection!.on('close', () => {
        this.logger.warn('RabbitMQ connection closed. Attempting to reconnect...');
        setTimeout(() => this.connect(), 5000);
      });

    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  /**
   * Start consuming messages from the queue
   */
  private async consume() {
    try {
      if (!this.channel) {
        throw new Error('Channel is not initialized');
      }

      // Set prefetch to 1 for fair dispatch
      await this.channel.prefetch(1);

      await this.channel.consume(
        this.queueName,
        async (message) => {
          if (message && this.channel) {
            try {
              const content = JSON.parse(message.content.toString());
              this.logger.log(`Received notification event: ${content.type}`);

              // Process the notification
              await this.processNotification(content);

              // Acknowledge the message
              this.channel.ack(message);
              
            } catch (error) {
              this.logger.error('Error processing notification:', error);
              
              // Reject and requeue the message
              if (this.channel) {
                this.channel.nack(message, false, true);
              }
            }
          }
        },
        { noAck: false },
      );

      this.logger.log('Started consuming notifications from queue');
      
    } catch (error) {
      this.logger.error('Error setting up consumer:', error);
    }
  }

  /**
   * Process notification and send via WebSocket
   */
  private async processNotification(data: CreateNotificationDto) {
    // Create notification in database
    const notification = await this.notificationsService.create(data);

    // Send notification via WebSocket to the user
    this.notificationsGateway.sendNotificationToUser(notification.userId, notification);

    this.logger.log(`Notification ${notification.id} processed and sent to user ${notification.userId}`);
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await (this.connection as any).close();
    }
    this.logger.log('RabbitMQ connection closed');
  }
}
