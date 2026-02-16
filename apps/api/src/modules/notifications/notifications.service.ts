import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

interface CreateNotificationPayload {
  userId: string;
  type: string;
  title: string;
  body: string;
  deepLink?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  @OnEvent('notifications.create')
  async handleCreateNotification(payload: CreateNotificationPayload) {
    await this.create(payload);
  }

  async create(payload: CreateNotificationPayload) {
    try {
      return await this.prisma.notification.create({
        data: {
          userId: payload.userId,
          type: payload.type as 'CHALLENGE_REMINDER' | 'STREAK_ALERT' | 'BADGE_EARNED' | 'NEW_CONTENT' | 'PROGRAM_UPDATE' | 'BILLING' | 'SYSTEM',
          title: payload.title,
          body: payload.body,
          deepLink: payload.deepLink,
          metadata: payload.metadata as Prisma.InputJsonValue | undefined,
        },
      });
    } catch (err) {
      this.logger.error('Failed to create notification', err);
    }
  }

  async getNotifications(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(notificationId: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }
}
