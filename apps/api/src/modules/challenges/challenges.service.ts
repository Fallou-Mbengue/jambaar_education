import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MinioService } from '../../minio/minio.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BADGE_RULES } from '@jambaar/shared';

@Injectable()
export class ChallengesService {
  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAll(userId: string) {
    const challenges = await this.prisma.challenge.findMany({
      where: { status: 'ACTIVE' },
      include: {
        badge: true,
        _count: { select: { days: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const userProgress = await this.prisma.challengeProgress.findMany({
      where: { userId, challengeId: { in: challenges.map((c) => c.id) } },
    });
    const progressMap = new Map(userProgress.map((p) => [p.challengeId, p]));

    return Promise.all(
      challenges.map(async (c) => ({
        ...c,
        thumbnailUrl: c.thumbnailKey
          ? await this.minio.getPresignedReadUrl(c.thumbnailKey)
          : null,
        userProgress: progressMap.get(c.id) ?? null,
      })),
    );
  }

  async findById(challengeId: string, userId: string) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        days: { orderBy: { dayNumber: 'asc' } },
        badge: true,
      },
    });
    if (!challenge) throw new NotFoundException('Challenge not found');

    const progress = await this.prisma.challengeProgress.findUnique({
      where: { userId_challengeId: { userId, challengeId } },
      include: {
        dayValidations: { include: { challengeDay: true } },
      },
    });

    const validatedDays = new Set(
      progress?.dayValidations.map((v) => v.challengeDay.dayNumber) ?? [],
    );

    return {
      ...challenge,
      thumbnailUrl: challenge.thumbnailKey
        ? await this.minio.getPresignedReadUrl(challenge.thumbnailKey)
        : null,
      progress,
      days: challenge.days.map((d) => ({
        ...d,
        isValidated: validatedDays.has(d.dayNumber),
        isLocked: !progress && d.dayNumber > 1,
      })),
    };
  }

  async join(challengeId: string, userId: string) {
    const challenge = await this.prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) throw new NotFoundException('Challenge not found');

    const existing = await this.prisma.challengeProgress.findUnique({
      where: { userId_challengeId: { userId, challengeId } },
    });
    if (existing) return existing;

    const progress = await this.prisma.challengeProgress.create({
      data: { userId, challengeId, currentDay: 1, lastActivityAt: new Date() },
    });

    this.eventEmitter.emit('analytics.track', {
      userId,
      eventName: 'challenge_joined',
      properties: { challengeId },
    });

    // Schedule reminder notification
    this.eventEmitter.emit('notifications.create', {
      userId,
      type: 'CHALLENGE_REMINDER',
      title: `Challenge démarré : ${challenge.title}`,
      body: 'Validez votre premier jour aujourd\'hui !',
      deepLink: `/challenges/${challengeId}`,
    });

    return progress;
  }

  async validateDay(challengeId: string, userId: string, dayNumber: number) {
    const progress = await this.prisma.challengeProgress.findUnique({
      where: { userId_challengeId: { userId, challengeId } },
      include: { dayValidations: true },
    });
    if (!progress) throw new BadRequestException('Join the challenge first');

    if (progress.status === 'COMPLETED') {
      throw new BadRequestException('Challenge already completed');
    }

    const day = await this.prisma.challengeDay.findUnique({
      where: { challengeId_dayNumber: { challengeId, dayNumber } },
    });
    if (!day) throw new NotFoundException(`Day ${dayNumber} not found`);

    // Check if already validated
    const alreadyValidated = progress.dayValidations.some(
      (v) => v.challengeDayId === day.id,
    );
    if (alreadyValidated) throw new BadRequestException('Day already validated');

    await this.prisma.challengeDayValidation.create({
      data: {
        challengeProgressId: progress.id,
        challengeDayId: day.id,
        xpEarned: day.xpReward,
      },
    });

    // Award XP
    this.eventEmitter.emit('gamification.awardXp', {
      userId,
      action: 'CHALLENGE_DAY_COMPLETED',
      metadata: { challengeId, dayNumber },
    });

    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      select: { durationDays: true },
    });
    const totalDays = challenge?.durationDays ?? 7;
    const newCurrentDay = Math.min(dayNumber + 1, totalDays);

    const isCompleted = dayNumber >= totalDays;

    await this.prisma.challengeProgress.update({
      where: { id: progress.id },
      data: {
        currentDay: newCurrentDay,
        status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: isCompleted ? new Date() : null,
        lastActivityAt: new Date(),
      },
    });

    if (isCompleted) {
      this.eventEmitter.emit('gamification.awardXp', {
        userId,
        action: 'CHALLENGE_COMPLETED',
        metadata: { challengeId },
      });
      this.eventEmitter.emit('gamification.awardBadge', {
        userId,
        ruleType: 'CHALLENGE_COMPLETE',
        challengeId,
      });
      this.eventEmitter.emit('analytics.track', {
        userId,
        eventName: 'challenge_completed',
        properties: { challengeId },
      });
    }

    return { dayValidated: dayNumber, isCompleted, xpEarned: day.xpReward };
  }
}
