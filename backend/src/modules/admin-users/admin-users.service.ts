import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminAuditService } from '../admin-audit/admin-audit.service';
import {
  UserFilterDto, ChangeRoleDto, ChangeStatusDto,
  AdjustGamificationDto, GrantPremiumDto, RevokePremiumDto,
} from './dto/user.dto';
import { buildPaginatedResponse } from '../../common/dto/pagination.dto';
import { Request } from 'express';

@Injectable()
export class AdminUsersService {
  constructor(
    private prisma: PrismaService,
    private audit: AdminAuditService,
  ) {}

  async findAll(filter: UserFilterDto) {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filter.q) {
      where.OR = [
        { email: { contains: filter.q, mode: 'insensitive' } },
        { firstName: { contains: filter.q, mode: 'insensitive' } },
        { lastName: { contains: filter.q, mode: 'insensitive' } },
      ];
    }
    if (filter.role) where.role = filter.role;
    if (filter.isPremium !== undefined) where.isPremium = filter.isPremium;
    if (filter.status) where.status = filter.status;
    if (filter.dateFrom || filter.dateTo) {
      where.createdAt = {};
      if (filter.dateFrom) where.createdAt.gte = new Date(filter.dateFrom);
      if (filter.dateTo) where.createdAt.lte = new Date(filter.dateTo);
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          isPremium: true,
          premiumUntil: true,
          createdAt: true,
          gamificationProfile: { select: { xp: true, level: true, streak: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, pageSize);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        isPremium: true,
        premiumUntil: true,
        suspendedAt: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        gamificationProfile: true,
        userBadges: { include: { badge: true } },
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { plan: true },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        challengeProgress: {
          include: { challenge: { select: { id: true, title: true } } },
        },
        quizAttempts: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { quiz: { select: { id: true, title: true } } },
        },
        _count: {
          select: { likes: true, saves: true, shareLogs: true },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async changeRole(id: string, dto: ChangeRoleDto, actorId: string, req: Request) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
    });

    await this.audit.log({
      actorId,
      action: 'CHANGE_ROLE',
      entityType: 'User',
      entityId: id,
      diff: { from: user.role, to: dto.role },
      req,
    });

    return { id: updated.id, role: updated.role };
  }

  async changeStatus(id: string, dto: ChangeStatusDto, actorId: string, req: Request) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const data: any = { status: dto.status };
    if (dto.status === 'SUSPENDED') {
      data.suspendedAt = new Date();
    } else {
      data.suspendedAt = null;
    }

    const updated = await this.prisma.user.update({ where: { id }, data });

    await this.audit.log({
      actorId,
      action: dto.status === 'SUSPENDED' ? 'SUSPEND_USER' : 'UNSUSPEND_USER',
      entityType: 'User',
      entityId: id,
      diff: { from: user.status, to: dto.status },
      req,
    });

    return { id: updated.id, status: updated.status };
  }

  async adjustGamification(id: string, dto: AdjustGamificationDto, actorId: string, req: Request) {
    if (!dto.reason) throw new BadRequestException('Reason is required');

    const profile = await this.prisma.gamificationProfile.findUnique({ where: { userId: id } });
    if (!profile) throw new NotFoundException('Gamification profile not found');

    const data: any = {};
    if (dto.xpDelta) data.xp = Math.max(0, profile.xp + dto.xpDelta);
    if (dto.resetStreak) data.streak = 0;

    const updated = await this.prisma.gamificationProfile.update({
      where: { userId: id },
      data,
    });

    await this.audit.log({
      actorId,
      action: 'ADJUST_GAMIFICATION',
      entityType: 'User',
      entityId: id,
      diff: { before: { xp: profile.xp, streak: profile.streak }, after: data },
      reason: dto.reason,
      req,
    });

    return updated;
  }

  async grantPremium(id: string, dto: GrantPremiumDto, actorId: string, req: Request) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const now = new Date();
    const base = user.premiumUntil && user.premiumUntil > now ? user.premiumUntil : now;
    const premiumUntil = new Date(base.getTime() + dto.days * 24 * 60 * 60 * 1000);

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isPremium: true, premiumUntil },
    });

    await this.audit.log({
      actorId,
      action: 'GRANT_PREMIUM',
      entityType: 'User',
      entityId: id,
      diff: { days: dto.days, premiumUntil },
      reason: dto.reason,
      req,
    });

    return { id: updated.id, isPremium: updated.isPremium, premiumUntil: updated.premiumUntil };
  }

  async revokePremium(id: string, dto: RevokePremiumDto, actorId: string, req: Request) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isPremium: false, premiumUntil: null },
    });

    await this.audit.log({
      actorId,
      action: 'REVOKE_PREMIUM',
      entityType: 'User',
      entityId: id,
      reason: dto.reason,
      req,
    });

    return { id: updated.id, isPremium: updated.isPremium };
  }
}
