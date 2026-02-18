import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminAuditService } from '../admin-audit/admin-audit.service';
import {
  CreatePlanDto, UpdatePlanDto, PlanFilterDto,
  SubscriptionFilterDto, ExtendSubscriptionDto, PaymentFilterDto,
} from './dto/billing.dto';
import { buildPaginatedResponse } from '../../common/dto/pagination.dto';
import { Request } from 'express';

@Injectable()
export class AdminBillingService {
  constructor(
    private prisma: PrismaService,
    private audit: AdminAuditService,
  ) {}

  // ── Plans ──

  async findAllPlans(filter: PlanFilterDto) {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filter.isActive !== undefined) where.isActive = filter.isActive;
    if (filter.q) where.name = { contains: filter.q, mode: 'insensitive' };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.subscriptionPlan.findMany({
        where, skip, take: pageSize, orderBy: { createdAt: 'desc' },
        include: { _count: { select: { subscriptions: true } } },
      }),
      this.prisma.subscriptionPlan.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, pageSize);
  }

  async createPlan(dto: CreatePlanDto, actorId: string, req: Request) {
    const plan = await this.prisma.subscriptionPlan.create({ data: dto });
    await this.audit.log({ actorId, action: 'CREATE', entityType: 'SubscriptionPlan', entityId: plan.id, diff: dto, req });
    return plan;
  }

  async updatePlan(id: string, dto: UpdatePlanDto, actorId: string, req: Request) {
    const existing = await this.prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Plan not found');

    const plan = await this.prisma.subscriptionPlan.update({ where: { id }, data: dto });
    await this.audit.log({ actorId, action: 'UPDATE', entityType: 'SubscriptionPlan', entityId: id, diff: dto, req });
    return plan;
  }

  async deletePlan(id: string, actorId: string, req: Request) {
    const existing = await this.prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Plan not found');

    await this.prisma.subscriptionPlan.update({ where: { id }, data: { isActive: false } });
    await this.audit.log({ actorId, action: 'DEACTIVATE', entityType: 'SubscriptionPlan', entityId: id, req });
    return { message: 'Plan deactivated' };
  }

  // ── Subscriptions ──

  async findAllSubscriptions(filter: SubscriptionFilterDto) {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filter.status) where.status = filter.status;
    if (filter.planId) where.planId = filter.planId;
    if (filter.userId) where.userId = filter.userId;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.subscription.findMany({
        where, skip, take: pageSize, orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          plan: { select: { id: true, name: true, interval: true, price: true } },
        },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, pageSize);
  }

  async cancelSubscription(id: string, actorId: string, req: Request) {
    const sub = await this.prisma.subscription.findUnique({ where: { id } });
    if (!sub) throw new NotFoundException('Subscription not found');

    const updated = await this.prisma.$transaction(async (tx) => {
      const s = await tx.subscription.update({
        where: { id },
        data: { status: 'CANCELED', canceledAt: new Date() },
      });

      // Apply soft suspension: set user to free
      await tx.user.update({
        where: { id: sub.userId },
        data: { isPremium: false, premiumUntil: null },
      });

      return s;
    });

    await this.audit.log({ actorId, action: 'CANCEL_SUBSCRIPTION', entityType: 'Subscription', entityId: id, req });
    return updated;
  }

  async extendSubscription(id: string, dto: ExtendSubscriptionDto, actorId: string, req: Request) {
    const sub = await this.prisma.subscription.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!sub) throw new NotFoundException('Subscription not found');

    const newEnd = new Date(sub.endDate.getTime() + dto.days * 24 * 60 * 60 * 1000);

    const updated = await this.prisma.$transaction(async (tx) => {
      const s = await tx.subscription.update({
        where: { id },
        data: { endDate: newEnd, status: 'ACTIVE' },
      });

      await tx.user.update({
        where: { id: sub.userId },
        data: { isPremium: true, premiumUntil: newEnd },
      });

      return s;
    });

    await this.audit.log({
      actorId,
      action: 'EXTEND_SUBSCRIPTION',
      entityType: 'Subscription',
      entityId: id,
      diff: { days: dto.days, newEndDate: newEnd },
      req,
    });

    return updated;
  }

  // ── Payments ──

  async findAllPayments(filter: PaymentFilterDto) {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filter.status) where.status = filter.status;
    if (filter.provider) where.provider = filter.provider;
    if (filter.dateFrom || filter.dateTo) {
      where.createdAt = {};
      if (filter.dateFrom) where.createdAt.gte = new Date(filter.dateFrom);
      if (filter.dateTo) where.createdAt.lte = new Date(filter.dateTo);
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where, skip, take: pageSize, orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          subscription: { select: { id: true, status: true } },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, pageSize);
  }

  async reconcilePayment(id: string, actorId: string, req: Request) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');

    const updated = await this.prisma.payment.update({
      where: { id },
      data: { status: 'SUCCESS' },
    });

    await this.audit.log({ actorId, action: 'RECONCILE_PAYMENT', entityType: 'Payment', entityId: id, req });
    return updated;
  }
}
