import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { XP_RULES, XpAction, calculateLevel, BADGE_RULES } from '@jambaar/shared';

interface AwardXpPayload {
  userId: string;
  action: XpAction;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('gamification.awardXp')
  async handleAwardXp(payload: AwardXpPayload) {
    await this.awardXp(payload.userId, payload.action, payload.metadata);
  }

  async awardXp(
    userId: string,
    action: XpAction,
    _metadata?: Record<string, unknown>,
  ): Promise<void> {
    const xpGain = XP_RULES[action];
    if (!xpGain) return;

    try {
      await this.prisma.$transaction(async (tx) => {
        const profile = await tx.gamificationProfile.upsert({
          where: { userId },
          create: { userId, totalXp: xpGain },
          update: { totalXp: { increment: xpGain } },
        });

        const newTotal = profile.totalXp + xpGain;
        const newLevel = calculateLevel(newTotal);
        const oldLevel = profile.currentLevel;

        if (newLevel !== oldLevel) {
          await tx.gamificationProfile.update({
            where: { userId },
            data: { currentLevel: newLevel },
          });
          this.eventEmitter.emit('gamification.levelUp', { userId, oldLevel, newLevel });
          // Create notification
          this.eventEmitter.emit('notifications.create', {
            userId,
            type: 'BADGE_EARNED',
            title: `Niveau ${newLevel} atteint !`,
            body: `Félicitations, tu es maintenant au niveau ${newLevel} !`,
            deepLink: '/profile',
          });
        }

        // Update streak
        await this.updateStreak(tx, userId);

        // Check badges
        await this.checkBadges(tx, userId, newTotal, profile);
      });
    } catch (err) {
      this.logger.error(`Failed to award XP to ${userId}`, err);
    }
  }

  private async updateStreak(
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
    userId: string,
  ) {
    const profile = await tx.gamificationProfile.findUnique({ where: { userId } });
    if (!profile) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActivity = profile.lastActivityDate;

    if (lastActivity) {
      const lastDate = new Date(lastActivity);
      lastDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 0) return; // Already updated today

      if (diffDays === 1) {
        // Consecutive day
        const newStreak = profile.currentStreak + 1;
        await tx.gamificationProfile.update({
          where: { userId },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, profile.longestStreak),
            lastActivityDate: new Date(),
          },
        });

        // Streak milestones
        if (newStreak === 7) {
          this.eventEmitter.emit('gamification.awardXp', { userId, action: 'STREAK_BONUS_7_DAYS' });
        } else if (newStreak === 30) {
          this.eventEmitter.emit('gamification.awardXp', { userId, action: 'STREAK_BONUS_30_DAYS' });
        }
      } else {
        // Streak broken
        await tx.gamificationProfile.update({
          where: { userId },
          data: { currentStreak: 1, lastActivityDate: new Date() },
        });
        this.eventEmitter.emit('notifications.create', {
          userId,
          type: 'STREAK_ALERT',
          title: 'Ton streak a été perdu !',
          body: 'Continue aujourd\'hui pour recommencer ta série !',
          deepLink: '/home',
        });
      }
    } else {
      // First activity
      await tx.gamificationProfile.update({
        where: { userId },
        data: { currentStreak: 1, longestStreak: 1, lastActivityDate: new Date() },
      });
    }
  }

  private async checkBadges(
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
    userId: string,
    totalXp: number,
    _profile: { currentStreak: number },
  ) {
    const badges = await tx.badge.findMany();
    const userBadges = await tx.userBadge.findMany({ where: { userId } });
    const ownedBadgeIds = new Set(userBadges.map((b) => b.badgeId));

    for (const badge of badges) {
      if (ownedBadgeIds.has(badge.id)) continue;

      let shouldAward = false;
      if (badge.ruleType === 'XP_MILESTONE') {
        const threshold = (badge.ruleValue as { xp: number })?.xp ?? 0;
        shouldAward = totalXp >= threshold;
      }

      if (shouldAward) {
        const gamProfile = await tx.gamificationProfile.findUnique({ where: { userId } });
        if (gamProfile) {
          await tx.userBadge.create({
            data: {
              userId,
              gamificationProfileId: gamProfile.id,
              badgeId: badge.id,
            },
          });
          this.eventEmitter.emit('notifications.create', {
            userId,
            type: 'BADGE_EARNED',
            title: `Badge débloqué : ${badge.name}`,
            body: badge.description,
            deepLink: '/profile',
          });
        }
      }
    }
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.gamificationProfile.findUnique({
      where: { userId },
      include: {
        badges: {
          include: { badge: true },
          orderBy: { earnedAt: 'desc' },
        },
      },
    });

    if (!profile) return null;

    const xpForCurrentLevel = (() => {
      const levels = [0, 500, 2000, 5000];
      const idx = ['Starter', 'Warrior', 'Lion', 'GOAT'].indexOf(profile.currentLevel);
      return levels[idx] ?? 0;
    })();
    const xpForNextLevel = (() => {
      const levels = [500, 2000, 5000, null];
      const idx = ['Starter', 'Warrior', 'Lion', 'GOAT'].indexOf(profile.currentLevel);
      return levels[idx];
    })();

    return {
      ...profile,
      xpInCurrentLevel: profile.totalXp - xpForCurrentLevel,
      xpToNextLevel: xpForNextLevel ? xpForNextLevel - profile.totalXp : 0,
      badges: await Promise.all(
        profile.badges.map(async (ub) => ({
          id: ub.badge.id,
          name: ub.badge.name,
          description: ub.badge.description,
          iconUrl: ub.badge.iconKey
            ? await this.minio_getReadUrl(ub.badge.iconKey)
            : null,
          earnedAt: ub.earnedAt,
        })),
      ),
    };
  }

  private async minio_getReadUrl(key: string): Promise<string> {
    // This is a workaround since we can't inject MinioService easily here due to module isolation
    // In production, inject MinioService or use a shared URL builder
    return `/api/v1/media/${key}`;
  }

  async awardBadgeByRule(userId: string, ruleType: string): Promise<void> {
    const badge = await this.prisma.badge.findFirst({ where: { ruleType } });
    if (!badge) return;

    const existing = await this.prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
    });
    if (existing) return;

    const profile = await this.prisma.gamificationProfile.findUnique({ where: { userId } });
    if (!profile) return;

    await this.prisma.userBadge.create({
      data: { userId, gamificationProfileId: profile.id, badgeId: badge.id },
    });

    this.eventEmitter.emit('notifications.create', {
      userId,
      type: 'BADGE_EARNED',
      title: `Badge débloqué : ${badge.name}`,
      body: badge.description,
      deepLink: '/profile',
    });
  }
}
