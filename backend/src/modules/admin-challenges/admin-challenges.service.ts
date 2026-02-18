import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminAuditService } from '../admin-audit/admin-audit.service';
import {
  CreateChallengeDto, UpdateChallengeDto,
  UpdateChallengeDayDto, ChallengeFilterDto,
} from './dto/challenge.dto';
import { buildPaginatedResponse } from '../../common/dto/pagination.dto';
import { Request } from 'express';

@Injectable()
export class AdminChallengesService {
  constructor(
    private prisma: PrismaService,
    private audit: AdminAuditService,
  ) {}

  async findAll(filter: ChallengeFilterDto) {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filter.q) where.title = { contains: filter.q, mode: 'insensitive' };
    if (filter.status) where.status = filter.status;
    if (filter.isPremium !== undefined) where.isPremium = filter.isPremium;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.challenge.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { days: true, progress: true } } },
      }),
      this.prisma.challenge.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, pageSize);
  }

  async findOne(id: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
      include: {
        days: { orderBy: { dayNumber: 'asc' } },
        _count: { select: { progress: true } },
      },
    });
    if (!challenge) throw new NotFoundException('Challenge not found');
    return challenge;
  }

  async create(dto: CreateChallengeDto, actorId: string, req: Request) {
    const challenge = await this.prisma.$transaction(async (tx) => {
      const ch = await tx.challenge.create({
        data: { ...dto, createdBy: actorId, updatedBy: actorId },
      });

      const days = Array.from({ length: 7 }, (_, i) => ({
        challengeId: ch.id,
        dayNumber: i + 1,
        title: `Jour ${i + 1}`,
      }));
      await tx.challengeDay.createMany({ data: days });

      return tx.challenge.findUnique({
        where: { id: ch.id },
        include: { days: { orderBy: { dayNumber: 'asc' } } },
      });
    });

    await this.audit.log({
      actorId,
      action: 'CREATE',
      entityType: 'Challenge',
      entityId: challenge!.id,
      diff: dto,
      req,
    });

    return challenge;
  }

  async update(id: string, dto: UpdateChallengeDto, actorId: string, req: Request) {
    await this.findOne(id);
    const challenge = await this.prisma.challenge.update({
      where: { id },
      data: { ...dto, updatedBy: actorId },
    });

    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entityType: 'Challenge',
      entityId: id,
      diff: dto,
      req,
    });

    return challenge;
  }

  async updateDay(id: string, dayNumber: number, dto: UpdateChallengeDayDto, actorId: string, req: Request) {
    await this.findOne(id);

    const day = await this.prisma.challengeDay.findUnique({
      where: { challengeId_dayNumber: { challengeId: id, dayNumber } },
    });
    if (!day) throw new NotFoundException(`Day ${dayNumber} not found`);

    const updated = await this.prisma.challengeDay.update({
      where: { id: day.id },
      data: dto,
    });

    await this.audit.log({
      actorId,
      action: 'UPDATE_DAY',
      entityType: 'ChallengeDay',
      entityId: day.id,
      diff: { challengeId: id, dayNumber, ...dto },
      req,
    });

    return updated;
  }

  async remove(id: string, actorId: string, req: Request) {
    await this.findOne(id);
    await this.prisma.challenge.update({
      where: { id },
      data: { status: 'ARCHIVED', updatedBy: actorId },
    });

    await this.audit.log({
      actorId,
      action: 'SOFT_DELETE',
      entityType: 'Challenge',
      entityId: id,
      req,
    });

    return { message: 'Challenge archived' };
  }
}
