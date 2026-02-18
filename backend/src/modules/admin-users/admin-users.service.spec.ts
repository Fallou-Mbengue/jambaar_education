import { Test, TestingModule } from '@nestjs/testing';
import { AdminUsersService } from './admin-users.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminAuditService } from '../admin-audit/admin-audit.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AdminUsersService', () => {
  let service: AdminUsersService;
  let prisma: any;
  let audit: any;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'USER',
    status: 'ACTIVE',
    isPremium: false,
    premiumUntil: null,
    suspendedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProfile = {
    userId: 'user-1',
    xp: 500,
    level: 3,
    streak: 5,
    longestStreak: 10,
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn().mockResolvedValue([mockUser]),
        findUnique: jest.fn().mockResolvedValue(mockUser),
        update: jest.fn().mockResolvedValue(mockUser),
        count: jest.fn().mockResolvedValue(1),
      },
      gamificationProfile: {
        findUnique: jest.fn().mockResolvedValue(mockProfile),
        update: jest.fn().mockResolvedValue(mockProfile),
      },
      $transaction: jest.fn((fns) => Promise.all(fns)),
    };

    audit = { log: jest.fn().mockResolvedValue({}) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: AdminAuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<AdminUsersService>(AdminUsersService);
  });

  describe('changeRole', () => {
    it('should change user role and log audit', async () => {
      prisma.user.update.mockResolvedValue({ ...mockUser, role: 'ADMIN' });
      const result = await service.changeRole('user-1', { role: 'ADMIN' as any }, 'actor-1', {} as any);
      expect(result.role).toBe('ADMIN');
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({
        action: 'CHANGE_ROLE',
        entityType: 'User',
      }));
    });

    it('should throw NotFoundException for missing user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.changeRole('missing', { role: 'ADMIN' as any }, 'a', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('changeStatus', () => {
    it('should suspend user and set suspendedAt', async () => {
      prisma.user.update.mockResolvedValue({ ...mockUser, status: 'SUSPENDED' });
      await service.changeStatus('user-1', { status: 'SUSPENDED' as any }, 'actor-1', {} as any);
      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'SUSPENDED', suspendedAt: expect.any(Date) }),
      }));
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({
        action: 'SUSPEND_USER',
      }));
    });
  });

  describe('adjustGamification', () => {
    it('should adjust XP with required reason', async () => {
      await service.adjustGamification('user-1', { xpDelta: 100, reason: 'test adjustment' }, 'actor-1', {} as any);
      expect(prisma.gamificationProfile.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ xp: 600 }),
      }));
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({
        action: 'ADJUST_GAMIFICATION',
        reason: 'test adjustment',
      }));
    });

    it('should not allow XP below 0', async () => {
      await service.adjustGamification('user-1', { xpDelta: -1000, reason: 'penalty' }, 'actor-1', {} as any);
      expect(prisma.gamificationProfile.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ xp: 0 }),
      }));
    });

    it('should throw BadRequestException without reason', async () => {
      await expect(service.adjustGamification('user-1', { xpDelta: 50, reason: '' }, 'actor-1', {} as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('grantPremium', () => {
    it('should grant premium for N days and log audit', async () => {
      prisma.user.update.mockResolvedValue({ ...mockUser, isPremium: true, premiumUntil: new Date() });
      await service.grantPremium('user-1', { days: 30, reason: 'partner offer' }, 'actor-1', {} as any);
      expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ isPremium: true }),
      }));
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({
        action: 'GRANT_PREMIUM',
      }));
    });
  });
});
