import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { MinioService } from '../../minio/minio.service';
import { CreateContentDto, UpdateContentDto, UpdateProgressDto } from './dto/content.dto';

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findById(contentId: string, userId: string) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
      include: {
        quiz: { include: { questions: { orderBy: { order: 'asc' } } } },
      },
    });
    if (!content) throw new NotFoundException('Content not found');
    if (content.status !== 'PUBLISHED') throw new NotFoundException('Content not available');

    const [userProgress, isLiked, isSaved] = await Promise.all([
      this.prisma.userProgress.findUnique({
        where: { userId_contentId: { userId, contentId } },
      }),
      this.prisma.like.findUnique({
        where: { userId_contentId: { userId, contentId } },
      }),
      this.prisma.save.findUnique({
        where: { userId_contentId: { userId, contentId } },
      }),
    ]);

    // Track view
    await this.prisma.content.update({
      where: { id: contentId },
      data: { viewCount: { increment: 1 } },
    });

    this.eventEmitter.emit('analytics.track', {
      userId,
      eventName: 'content_viewed',
      properties: { contentId, type: content.type },
    });

    const thumbnailUrl = content.thumbnailKey
      ? await this.minio.getPresignedReadUrl(content.thumbnailKey)
      : null;
    const videoUrl = content.videoKey
      ? await this.minio.getPresignedReadUrl(content.videoKey)
      : null;

    return {
      ...content,
      thumbnailUrl,
      videoUrl,
      isLiked: !!isLiked,
      isSaved: !!isSaved,
      progress: userProgress,
    };
  }

  async updateProgress(contentId: string, userId: string, dto: UpdateProgressDto) {
    const content = await this.prisma.content.findUnique({ where: { id: contentId } });
    if (!content) throw new NotFoundException('Content not found');

    const isCompleted = dto.progressPercent >= 90;

    const progress = await this.prisma.userProgress.upsert({
      where: { userId_contentId: { userId, contentId } },
      create: {
        userId,
        contentId,
        watchedSeconds: dto.watchedSeconds,
        progressPercent: dto.progressPercent,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        lastAccessedAt: new Date(),
      },
      update: {
        watchedSeconds: dto.watchedSeconds,
        progressPercent: Math.max(dto.progressPercent, 0),
        isCompleted,
        completedAt: isCompleted ? new Date() : undefined,
        lastAccessedAt: new Date(),
      },
    });

    if (isCompleted) {
      this.eventEmitter.emit('analytics.track', {
        userId,
        eventName: 'content_completed',
        properties: { contentId },
      });
    }

    return progress;
  }

  async toggleLike(contentId: string, userId: string) {
    const existing = await this.prisma.like.findUnique({
      where: { userId_contentId: { userId, contentId } },
    });

    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } });
      await this.prisma.content.update({
        where: { id: contentId },
        data: { likeCount: { decrement: 1 } },
      });
      return { liked: false };
    } else {
      await this.prisma.like.create({ data: { userId, contentId } });
      await this.prisma.content.update({
        where: { id: contentId },
        data: { likeCount: { increment: 1 } },
      });
      return { liked: true };
    }
  }

  async toggleSave(contentId: string, userId: string) {
    const existing = await this.prisma.save.findUnique({
      where: { userId_contentId: { userId, contentId } },
    });

    if (existing) {
      await this.prisma.save.delete({ where: { id: existing.id } });
      await this.prisma.content.update({
        where: { id: contentId },
        data: { saveCount: { decrement: 1 } },
      });
      return { saved: false };
    } else {
      await this.prisma.save.create({ data: { userId, contentId } });
      await this.prisma.content.update({
        where: { id: contentId },
        data: { saveCount: { increment: 1 } },
      });
      return { saved: true };
    }
  }

  async share(contentId: string, userId: string, platform: string) {
    await Promise.all([
      this.prisma.shareLog.create({ data: { userId, contentId, platform } }),
      this.prisma.content.update({
        where: { id: contentId },
        data: { shareCount: { increment: 1 } },
      }),
    ]);
    return { shared: true };
  }

  async getSaved(userId: string) {
    const saves = await this.prisma.save.findMany({
      where: { userId },
      include: { content: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return Promise.all(
      saves.map(async (s) => ({
        ...s.content,
        thumbnailUrl: s.content.thumbnailKey
          ? await this.minio.getPresignedReadUrl(s.content.thumbnailKey)
          : null,
        savedAt: s.createdAt,
      })),
    );
  }

  // Admin methods
  async create(dto: CreateContentDto, adminId: string) {
    const content = await this.prisma.content.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type as 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'MICRO_LEARNING',
        tags: dto.tags ?? [],
        durationSeconds: dto.durationSeconds,
        isPremium: dto.isPremium ?? false,
        thumbnailKey: dto.thumbnailKey,
        videoKey: dto.videoKey,
        articleBody: dto.articleBody,
      },
    });

    await this.prisma.adminContentAudit.create({
      data: { adminId, contentId: content.id, action: 'created' },
    });

    return content;
  }

  async update(contentId: string, dto: UpdateContentDto, adminId: string) {
    const content = await this.prisma.content.findUnique({ where: { id: contentId } });
    if (!content) throw new NotFoundException('Content not found');

    const { status, ...rest } = dto;
    const data: Parameters<typeof this.prisma.content.update>[0]['data'] = {
      ...rest,
      ...(status && { status: status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' }),
      ...(status === 'PUBLISHED' && !content.publishedAt ? { publishedAt: new Date() } : {}),
    };
    const updated = await this.prisma.content.update({
      where: { id: contentId },
      data,
    });

    await this.prisma.adminContentAudit.create({
      data: { adminId, contentId, action: 'updated', changes: dto as object },
    });

    return updated;
  }

  async findAllAdmin(params: { status?: string; type?: string; page?: number; limit?: number }) {
    const { status, type, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const where = {
      ...(status && { status: status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' }),
      ...(type && { type: type as 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'MICRO_LEARNING' }),
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

    return { items, total, page, limit };
  }
}
