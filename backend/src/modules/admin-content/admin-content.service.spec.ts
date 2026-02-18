import { Test, TestingModule } from '@nestjs/testing';
import { AdminContentService } from './admin-content.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminAuditService } from '../admin-audit/admin-audit.service';
import { NotFoundException } from '@nestjs/common';

describe('AdminContentService', () => {
  let service: AdminContentService;
  let prisma: any;
  let audit: any;

  const mockContent = {
    id: 'content-1',
    title: 'Test Content',
    description: 'Desc',
    tags: ['test'],
    skills: ['skill1'],
    level: 'BEGINNER',
    duration: 15,
    status: 'DRAFT',
    isPremium: false,
    coverKey: null,
    videoKey: null,
    publishedAt: null,
    publishedBy: null,
    createdBy: 'actor-1',
    updatedBy: 'actor-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    quizzes: [],
    _count: { likes: 0, saves: 0, shares: 0 },
  };

  beforeEach(async () => {
    prisma = {
      content: {
        findMany: jest.fn().mockResolvedValue([mockContent]),
        findUnique: jest.fn().mockResolvedValue(mockContent),
        create: jest.fn().mockResolvedValue(mockContent),
        update: jest.fn().mockResolvedValue({ ...mockContent, status: 'PUBLISHED' }),
        count: jest.fn().mockResolvedValue(1),
      },
      $transaction: jest.fn((fns) => Promise.all(fns)),
    };

    audit = {
      log: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminContentService,
        { provide: PrismaService, useValue: prisma },
        { provide: AdminAuditService, useValue: audit },
      ],
    }).compile();

    service = module.get<AdminContentService>(AdminContentService);
  });

  describe('findAll', () => {
    it('should return paginated content', async () => {
      const result = await service.findAll({ page: 1, pageSize: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return content by id', async () => {
      const result = await service.findOne('content-1');
      expect(result.id).toBe('content-1');
    });

    it('should throw NotFoundException for missing content', async () => {
      prisma.content.findUnique.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create content and log audit', async () => {
      const dto = { title: 'New', description: 'Desc', tags: ['tag'], skills: [], level: 'BEGINNER' as const };
      await service.create(dto, 'actor-1', {} as any);
      expect(prisma.content.create).toHaveBeenCalled();
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({
        action: 'CREATE',
        entityType: 'Content',
      }));
    });
  });

  describe('publish', () => {
    it('should publish content and log audit', async () => {
      const result = await service.publish('content-1', 'actor-1', {} as any);
      expect(prisma.content.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'content-1' },
        data: expect.objectContaining({ status: 'PUBLISHED' }),
      }));
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({
        action: 'PUBLISH',
      }));
    });
  });

  describe('duplicate', () => {
    it('should create a copy with (copy) suffix', async () => {
      await service.duplicate('content-1', 'actor-1', {} as any);
      expect(prisma.content.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          title: 'Test Content (copy)',
          status: 'DRAFT',
        }),
      }));
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({
        action: 'DUPLICATE',
      }));
    });
  });
});
