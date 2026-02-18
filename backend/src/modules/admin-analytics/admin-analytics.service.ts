import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminAnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsersToday,
      newUsersWeek,
      premiumUsers,
      totalContent,
      publishedContent,
      activeSubscriptions,
      totalRevenue,
      completedChallenges,
      quizAttempts,
      onboardingCompleted,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: dayAgo } } }),
      this.prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      this.prisma.user.count({ where: { isPremium: true } }),
      this.prisma.content.count(),
      this.prisma.content.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
      this.prisma.challengeProgress.count({
        where: { completedAt: { not: null } },
      }),
      this.prisma.quizAttempt.count({ where: { createdAt: { gte: monthAgo } } }),
      this.prisma.userProfile.count({ where: { onboardingCompleted: true } }),
    ]);

    const conversionRate = totalUsers > 0
      ? Math.round((premiumUsers / totalUsers) * 10000) / 100
      : 0;

    const activationRate = totalUsers > 0
      ? Math.round((onboardingCompleted / totalUsers) * 10000) / 100
      : 0;

    return {
      users: {
        total: totalUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersWeek,
        premium: premiumUsers,
        conversionRate,
        activationRate,
      },
      content: {
        total: totalContent,
        published: publishedContent,
      },
      billing: {
        activeSubscriptions,
        totalRevenue: totalRevenue._sum.amount || 0,
      },
      engagement: {
        completedChallenges,
        quizAttemptsThisMonth: quizAttempts,
      },
    };
  }

  async getActivation() {
    const totalUsers = await this.prisma.user.count();
    const withProfile = await this.prisma.userProfile.count({ where: { onboardingCompleted: true } });
    const withFirstQuiz = await this.prisma.quizAttempt.groupBy({
      by: ['userId'],
    });
    const withFirstChallenge = await this.prisma.challengeProgress.groupBy({
      by: ['userId'],
    });

    return {
      totalUsers,
      onboardingCompleted: withProfile,
      onboardingRate: totalUsers > 0 ? Math.round((withProfile / totalUsers) * 10000) / 100 : 0,
      usersWithQuizAttempt: withFirstQuiz.length,
      usersWithChallenge: withFirstChallenge.length,
    };
  }

  async getRetention() {
    const now = new Date();
    const periods = [7, 14, 30].map((days) => {
      const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      return { days, start };
    });

    const results = await Promise.all(
      periods.map(async ({ days, start }) => {
        const cohort = await this.prisma.user.count({
          where: { createdAt: { lte: start } },
        });
        const retained = await this.prisma.analyticsEvent.groupBy({
          by: ['userId'],
          where: {
            createdAt: { gte: start },
            userId: { not: null },
          },
        });
        return {
          period: `${days}d`,
          cohortSize: cohort,
          retained: retained.length,
          rate: cohort > 0 ? Math.round((retained.length / cohort) * 10000) / 100 : 0,
        };
      }),
    );

    return { retention: results };
  }
}
