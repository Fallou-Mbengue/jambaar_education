import { Test, TestingModule } from '@nestjs/testing';
import { AdminBillingService } from './admin-billing.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminAuditService } from '../admin-audit/admin-audit.service';
import { NotFoundException } from '@nestjs/common';

describe('AdminBillingService', () => {
  let service: AdminBillingService;
  let prisma: any;
  let audit: any;

  const mockSub = {
    id: 'sub-1',
    userId: 'user-1',
    planId: 'plan-1',
    status: 'ACTIVE',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    canceledAt: null,
    user: { id: 'user-1', isPremium: true },
  };

  beforeEach(async () => {
    prisma = {
      subscriptionPlan: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue({ id: 'plan-1', name: 'Monthly' }),
        create: jest.fn().mockResolvedValue({ id: 'plan-1' }),
        update: jest.fn().mockResolvedValue({}),
        count: jest.fn().mockResolvedValue(0),
      },
      subscription: {
        findMany: jest.fn().mockResolvedValue([mockSub]),
        findUnique: jest.fn().mockResolvedValue(mockSub),
        update: jest.fn().mockResolvedValue(mockSub),
        count: jest.fn().mockResolvedValue(1),
      },
      payment: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue({ id: 'pay-1', status: 'PENDING' }),
        update: jest.fn().mockResolvedValue({ id: 'pay-1', status: 'SUCCESS' }),
        count: jest.fn().mockResolvedValue(0),
      },
      user: {
        update: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn((fn) => {
        if (typeof fn === 'function') {
          return fn({
            subscription: prisma.subscription,
            user: prisma.user,
          });
        }
        return Promise.all(fn);
      }),
    };

    audit = { log: jest.fn().mockResolvedValue({}) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminBillingService,
        { provide: PrismaService, useValue: prisma },
        { provide: AdminAuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<AdminBillingService>(AdminBillingService);
  });

  describe('extendSubscription', () => {
    it('should extend subscription end date and update premium', async () => {
      await service.extendSubscription('sub-1', { days: 7 }, 'actor-1', {} as any);

      expect(prisma.subscription.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'ACTIVE' }),
      }));
      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ isPremium: true }),
      }));
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({
        action: 'EXTEND_SUBSCRIPTION',
      }));
    });

    it('should throw NotFoundException for missing subscription', async () => {
      prisma.subscription.findUnique.mockResolvedValue(null);
      await expect(service.extendSubscription('missing', { days: 7 }, 'a', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel and revoke premium', async () => {
      await service.cancelSubscription('sub-1', 'actor-1', {} as any);

      expect(prisma.subscription.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'CANCELED' }),
      }));
      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ isPremium: false }),
      }));
    });
  });

  describe('reconcilePayment', () => {
    it('should mark payment as SUCCESS', async () => {
      const result = await service.reconcilePayment('pay-1', 'actor-1', {} as any);
      expect(prisma.payment.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { status: 'SUCCESS' },
      }));
    });
  });
});
