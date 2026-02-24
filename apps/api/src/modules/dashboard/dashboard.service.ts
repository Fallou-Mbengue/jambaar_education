import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getKpis() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previousMonthStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const previousMonthEnd = thirtyDaysAgo;

    const [
      totalUsers,
      activeUsers30d,
      activeUsers7d,
      previousMonthUsers,
      totalContent,
      publishedContent,
      previousMonthContent,
      activeSubscriptions,
      totalRevenue,
      previousMonthRevenue,
      totalPayments,
      previousMonthPayments,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'USER' } }),
      this.prisma.user.count({
        where: { role: 'USER', lastLoginAt: { gte: thirtyDaysAgo } },
      }),
      this.prisma.user.count({
        where: { role: 'USER', lastLoginAt: { gte: sevenDaysAgo } },
      }),
      this.prisma.user.count({
        where: { role: 'USER', createdAt: { gte: previousMonthStart, lt: previousMonthEnd } },
      }),
      this.prisma.content.count(),
      this.prisma.content.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.content.count({
        where: { createdAt: { gte: previousMonthStart, lt: previousMonthEnd } },
      }),
      this.prisma.subscription.count({ where: { status: 'ACTIVE', endDate: { gt: now } } }),
      this.prisma.payment
        .aggregate({ where: { status: 'SUCCESS' }, _sum: { amountXof: true } })
        .then((r) => r._sum.amountXof ?? 0),
      this.prisma.payment
        .aggregate({
          where: { status: 'SUCCESS', createdAt: { gte: previousMonthStart, lt: previousMonthEnd } },
          _sum: { amountXof: true },
        })
        .then((r) => r._sum.amountXof ?? 0),
      this.prisma.payment.count({ where: { status: 'SUCCESS' } }),
      this.prisma.payment.count({
        where: { status: 'SUCCESS', createdAt: { gte: previousMonthStart, lt: previousMonthEnd } },
      }),
    ]);

    // Calculate trends
    const userTrend = previousMonthUsers > 0
      ? Math.round(((totalUsers - previousMonthUsers) / previousMonthUsers) * 100)
      : 0;
    const contentTrend = previousMonthContent > 0
      ? Math.round(((publishedContent - previousMonthContent) / previousMonthContent) * 100)
      : 0;
    const revenueTrend = previousMonthRevenue > 0
      ? Math.round(((totalRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)
      : 0;
    const paymentTrend = previousMonthPayments > 0
      ? Math.round(((totalPayments - previousMonthPayments) / previousMonthPayments) * 100)
      : 0;

    return {
      users: {
        total: totalUsers,
        trend: userTrend,
        active30d: activeUsers30d,
        active7d: activeUsers7d,
        retentionRate30d: totalUsers > 0 ? Math.round((activeUsers30d / totalUsers) * 100) : 0,
      },
      content: {
        total: publishedContent,
        trend: contentTrend,
        published: publishedContent,
      },
      payments: {
        total: totalPayments,
        trend: paymentTrend,
      },
      billing: {
        activeSubscriptions,
        totalRevenueXof: totalRevenue,
        trend: revenueTrend,
      },
    };
  }

  async getRecentTransactions(limit = 5) {
    const payments = await this.prisma.payment.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          include: { profile: true },
        },
        subscription: {
          include: { plan: true },
        },
      },
    });

    return payments.map((payment) => ({
      id: payment.id,
      transactionRef: payment.providerRef || payment.id.slice(0, 8).toUpperCase(),
      user: {
        id: payment.user.id,
        firstName: payment.user.profile?.firstName || 'Utilisateur',
        lastName: payment.user.profile?.lastName || '',
        email: payment.user.email,
      },
      courseName: payment.subscription?.plan?.name || 'Abonnement',
      amount: payment.amountXof,
      status: payment.status,
      createdAt: payment.createdAt,
    }));
  }

  async getRecentUsers(limit = 5) {
    const users = await this.prisma.user.findMany({
      where: { role: 'USER' },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { profile: true },
    });

    return users.map((user) => ({
      id: user.id,
      firstName: user.profile?.firstName || 'Utilisateur',
      lastName: user.profile?.lastName || '',
      email: user.email,
      createdAt: user.createdAt,
    }));
  }

  async getUserProgress(params: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, role, status, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    // Role filter
    if (role && ['USER', 'COACH', 'ADMIN'].includes(role)) {
      where.role = role;
    }

    // Status filter (isActive)
    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'banned') {
      where.isActive = false;
    }

    // Search
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { firstName: { contains: search, mode: 'insensitive' } } },
        { profile: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

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

  async toggleUserStatus(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      include: { profile: true },
    });

    return { id: updated.id, isActive: updated.isActive };
  }

  async deleteUser(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
    return { deleted: true };
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
