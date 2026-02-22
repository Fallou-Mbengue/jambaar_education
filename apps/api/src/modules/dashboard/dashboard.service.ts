import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getKpis() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      activeUsers30d,
      activeUsers7d,
      totalContent,
      publishedContent,
      activeSubscriptions,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'USER' } }),
      this.prisma.user.count({
        where: { role: 'USER', lastLoginAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.user.count({
        where: { role: 'USER', lastLoginAt: { gte: sevenDaysAgo } },
      }),
      this.prisma.content.count(),
      this.prisma.content.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.subscription.count({ where: { status: 'ACTIVE', endDate: { gt: now } } }),
      this.prisma.payment
        .aggregate({ where: { status: 'SUCCESS' }, _sum: { amountXof: true } })
        .then((r) => r._sum.amountXof ?? 0),
    ]);

    return {
      users: {
        total: totalUsers,
        active30d: activeUsers30d,
        active7d: activeUsers7d,
        retentionRate30d: totalUsers > 0 ? Math.round((activeUsers30d / totalUsers) * 100) : 0,
      },
      content: { total: totalContent, published: publishedContent },
      billing: { activeSubscriptions, totalRevenueXof: totalRevenue },
    };
  }

  async getUserProgress(params: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          role: 'USER' as const,
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { profile: { firstName: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : { role: 'USER' as const };

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          profile: true,
          _count: {
            select: {
              progresses: { where: { isCompleted: true } },
            },
          },
          subscriptions: {
            where: { status: 'ACTIVE' },
            take: 1,
            include: { plan: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: users.map(({ passwordHash: _ph, ...u }) => ({
        ...u,
        completedContent: u._count.progresses,
        activeSubscription: u.subscriptions[0] ?? null,
      })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getUserSoftSkillScores(userId: string) {
    // Calculate soft skill scores based on completed content by tag
    const completedContent = await this.prisma.userProgress.findMany({
      where: { userId, isCompleted: true, contentId: { not: null } },
      include: { content: { select: { tags: true } } },
    });

    const skillCounts: Record<string, number> = {};
    for (const progress of completedContent) {
      for (const tag of progress.content?.tags ?? []) {
        skillCounts[tag] = (skillCounts[tag] ?? 0) + 1;
      }
    }

    const maxCount = Math.max(...Object.values(skillCounts), 1);
    return Object.entries(skillCounts).map(([skill, count]) => ({
      skill,
      score: Math.min(Math.round((count / maxCount) * 100), 100),
      contentCompleted: count,
    }));
  }

  async getContentList(params: {
    status?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, type, search, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status: status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' }),
      ...(type && { type: type as 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'MICRO_LEARNING' }),
      ...(search && { title: { contains: search, mode: 'insensitive' as const } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.content.count({ where }),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }
}
