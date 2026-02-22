import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

interface SubscribeDto {
  planId: string;
  provider: 'WAVE' | 'ORANGE_MONEY';
  phoneNumber: string;
}

interface WebhookPayload {
  providerRef: string;
  status: 'SUCCESS' | 'FAILED';
  amount?: number;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private readonly SUBSCRIPTION_CACHE_TTL = 300; // 5 min

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priceXof: 'asc' },
    });
  }

  async subscribe(userId: string, dto: SubscribeDto) {
    const plan = await this.prisma.subscriptionPlan.findUnique({ where: { id: dto.planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    // Create subscription in PENDING state
    const subscription = await this.prisma.subscription.create({
      data: { userId, planId: dto.planId, status: 'PENDING' },
    });

    // Create payment record
    const payment = await this.prisma.payment.create({
      data: {
        userId,
        subscriptionId: subscription.id,
        provider: dto.provider,
        phoneNumber: dto.phoneNumber,
        amountXof: plan.priceXof,
        status: 'PENDING',
        metadata: { planName: plan.name },
      },
    });

    // In a real implementation, call Wave/OM API here to initiate USSD payment
    // For MVP, return the payment reference for frontend to poll
    const providerRef = `MOCK_${payment.id.slice(0, 8).toUpperCase()}`;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { providerRef },
    });

    this.eventEmitter.emit('analytics.track', {
      userId,
      eventName: 'payment_initiated',
      properties: { planId: dto.planId, provider: dto.provider, amount: plan.priceXof },
    });

    return {
      subscriptionId: subscription.id,
      paymentId: payment.id,
      providerRef,
      status: 'PENDING',
      message: `Paiement en attente. Confirmez via ${dto.provider === 'WAVE' ? 'Wave' : 'Orange Money'}.`,
    };
  }

  async handleWebhook(provider: string, rawBody: string, signature?: string): Promise<void> {
    let payload: WebhookPayload;
    try {
      payload = JSON.parse(rawBody) as WebhookPayload;
    } catch {
      this.logger.error('Invalid webhook payload');
      return;
    }

    // Idempotency check
    const existing = await this.prisma.webhookEvent.findUnique({
      where: { providerRef: payload.providerRef },
    });
    if (existing?.processed) {
      this.logger.log(`Webhook ${payload.providerRef} already processed`);
      return;
    }

    // Persist immediately (idempotency)
    const webhookEvent = await this.prisma.webhookEvent.upsert({
      where: { providerRef: payload.providerRef },
      create: {
        provider,
        eventType: payload.status,
        providerRef: payload.providerRef,
        payload: payload as object,
        processed: false,
      },
      update: {},
    });

    try {
      await this.processWebhook(payload);
      await this.prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { processed: true, processedAt: new Date() },
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      await this.prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { error },
      });
      this.logger.error(`Failed to process webhook ${payload.providerRef}`, err);
    }
  }

  private async processWebhook(payload: WebhookPayload): Promise<void> {
    const payment = await this.prisma.payment.findFirst({
      where: { providerRef: payload.providerRef },
      include: { subscription: { include: { plan: true } } },
    });
    if (!payment) return;

    if (payload.status === 'SUCCESS') {
      const now = new Date();
      const endDate = this.calculateEndDate(now, payment.subscription.plan.billingPeriod);

      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS' },
        }),
        this.prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: { status: 'ACTIVE', startDate: now, endDate },
        }),
      ]);

      // Invalidate subscription cache
      await this.redis.del(`sub_active:${payment.userId}`);

      // Notify user
      this.eventEmitter.emit('notifications.create', {
        userId: payment.userId,
        type: 'BILLING',
        title: 'Paiement confirmé ! 🎉',
        body: `Ton abonnement ${payment.subscription.plan.name} est activé jusqu\'au ${endDate.toLocaleDateString('fr-FR')}.`,
        deepLink: '/profile',
      });

      this.eventEmitter.emit('analytics.track', {
        userId: payment.userId,
        eventName: 'payment_success',
        properties: { planId: payment.subscription.planId, amount: payment.amountXof },
      });
    } else if (payload.status === 'FAILED') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });

      this.eventEmitter.emit('notifications.create', {
        userId: payment.userId,
        type: 'BILLING',
        title: 'Paiement échoué',
        body: 'Le paiement n\'a pas pu être traité. Réessaie ou contacte le support.',
        deepLink: '/billing',
      });
    }
  }

  private calculateEndDate(startDate: Date, billingPeriod: string): Date {
    const end = new Date(startDate);
    switch (billingPeriod) {
      case 'WEEKLY':
        end.setDate(end.getDate() + 7);
        break;
      case 'MONTHLY':
        end.setMonth(end.getMonth() + 1);
        break;
      case 'QUARTERLY':
        end.setMonth(end.getMonth() + 3);
        break;
    }
    return end;
  }

  async isSubscriptionActive(userId: string): Promise<boolean> {
    const cacheKey = `sub_active:${userId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached !== null) return cached === '1';

    const active = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        endDate: { gt: new Date() },
      },
    });

    const isActive = !!active;
    await this.redis.set(cacheKey, isActive ? '1' : '0', this.SUBSCRIPTION_CACHE_TTL);
    return isActive;
  }

  async getSubscriptionStatus(userId: string) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId },
      include: { plan: true, payments: { orderBy: { createdAt: 'desc' }, take: 20 } },
      orderBy: { createdAt: 'desc' },
    });

    return {
      subscription,
      isActive: await this.isSubscriptionActive(userId),
    };
  }

  async getPaymentStatus(paymentId: string, userId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, userId },
      include: { subscription: { include: { plan: true } } },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  // Admin: list subscriptions
  async listSubscriptions(params: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where: status ? { status: status as 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING' } : {},
        include: { user: { include: { profile: true } }, plan: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.subscription.count({
        where: status ? { status: status as 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING' } : {},
      }),
    ]);
    return { items, total, page, limit };
  }

  // Mock: simulate webhook (for testing)
  async simulatePaymentSuccess(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');

    const providerRef = payment.providerRef ?? paymentId;
    await this.processWebhook({ providerRef, status: 'SUCCESS' });
    return { message: 'Payment simulated as successful' };
  }
}
