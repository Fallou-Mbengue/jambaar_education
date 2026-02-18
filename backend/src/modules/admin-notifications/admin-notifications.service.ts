import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminAuditService } from '../admin-audit/admin-audit.service';
import { CreateNotificationDto, NotificationFilterDto } from './dto/notification.dto';
import { buildPaginatedResponse } from '../../common/dto/pagination.dto';
import { Request } from 'express';

@Injectable()
export class AdminNotificationsService {
  constructor(
    private prisma: PrismaService,
    private audit: AdminAuditService,
  ) {}

  async create(dto: CreateNotificationDto, actorId: string, req: Request) {
    return this.prisma.$transaction(async (tx) => {
      const notification = await tx.notification.create({
        data: {
          title: dto.title,
          body: dto.body,
          deepLink: dto.deepLink,
          segment: dto.segment,
          sentBy: actorId,
          metadata: dto.challengeId ? { challengeId: dto.challengeId } : undefined,
        },
      });

      let userIds: string[] = [];

      switch (dto.segment) {
        case 'ALL':
          const allUsers = await tx.user.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true },
          });
          userIds = allUsers.map((u) => u.id);
          break;

        case 'PREMIUM':
          const premiumUsers = await tx.user.findMany({
            where: { status: 'ACTIVE', isPremium: true },
            select: { id: true },
          });
          userIds = premiumUsers.map((u) => u.id);
          break;

        case 'NON_PREMIUM':
          const freeUsers = await tx.user.findMany({
            where: { status: 'ACTIVE', isPremium: false },
            select: { id: true },
          });
          userIds = freeUsers.map((u) => u.id);
          break;

        case 'CHALLENGE_PARTICIPANTS':
          if (dto.challengeId) {
            const participants = await tx.challengeProgress.findMany({
              where: { challengeId: dto.challengeId },
              select: { userId: true },
            });
            userIds = participants.map((p) => p.userId);
          }
          break;

        case 'CUSTOM':
          userIds = dto.userIds || [];
          break;
      }

      if (userIds.length > 0) {
        await tx.notificationTarget.createMany({
          data: userIds.map((userId) => ({
            notificationId: notification.id,
            userId,
          })),
          skipDuplicates: true,
        });
      }

      await this.audit.log({
        actorId,
        action: 'SEND_NOTIFICATION',
        entityType: 'Notification',
        entityId: notification.id,
        diff: { segment: dto.segment, targetCount: userIds.length },
        req,
      });

      return { ...notification, targetCount: userIds.length };
    });
  }

  async findAll(filter: NotificationFilterDto) {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { targets: true } } },
      }),
      this.prisma.notification.count(),
    ]);

    return buildPaginatedResponse(data, total, page, pageSize);
  }
}
