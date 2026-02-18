import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminAuditService } from '../admin-audit/admin-audit.service';
import { CreateContentDto, UpdateContentDto, ContentFilterDto } from './dto/content.dto';
import { buildPaginatedResponse } from '../../common/dto/pagination.dto';
import { Request } from 'express';

@Injectable()
export class AdminContentService {
  constructor(
    private prisma: PrismaService,
    private audit: AdminAuditService,
  ) {}

  async findAll(filter: ContentFilterDto) {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filter.q) {
      where.OR = [
        { title: { contains: filter.q, mode: 'insensitive' } },
        { description: { contains: filter.q, mode: 'insensitive' } },
      ];
    }
    if (filter.status) where.status = filter.status;
    if (filter.isPremium !== undefined) where.isPremium = filter.isPremium;
    if (filter.level) where.level = filter.level;

    const orderBy: any = {};
    if (filter.sortBy) {
      orderBy[filter.sortBy] = filter.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.content.findMany({ where, skip, take: pageSize, orderBy }),
      this.prisma.content.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, pageSize);
  }

  async findOne(id: string) {
    const content = await this.prisma.content.findUnique({
      where: { id },
      include: {
        quizzes: { select: { id: true, title: true } },
        _count: { select: { likes: true, saves: true, shares: true } },
      },
    });
    if (!content) throw new NotFoundException('Content not found');
    return content;
  }

  async create(dto: CreateContentDto, actorId: string, req: Request) {
    const content = await this.prisma.content.create({
      data: {
        ...dto,
        createdBy: actorId,
        updatedBy: actorId,
      },
    });

    await this.audit.log({
      actorId,
      action: 'CREATE',
      entityType: 'Content',
      entityId: content.id,
      diff: dto,
      req,
    });

    return content;
  }

  async update(id: string, dto: UpdateContentDto, actorId: string, req: Request) {
    const existing = await this.findOne(id);

    const content = await this.prisma.content.update({
      where: { id },
      data: { ...dto, updatedBy: actorId },
    });

    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entityType: 'Content',
      entityId: id,
      diff: { before: existing, after: dto },
      req,
    });

    return content;
  }

  async publish(id: string, actorId: string, req: Request) {
    await this.findOne(id);

    const content = await this.prisma.content.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        publishedBy: actorId,
        updatedBy: actorId,
      },
    });

    await this.audit.log({
      actorId,
      action: 'PUBLISH',
      entityType: 'Content',
      entityId: id,
      req,
    });

    return content;
  }

  async archive(id: string, actorId: string, req: Request) {
    await this.findOne(id);

    const content = await this.prisma.content.update({
      where: { id },
      data: { status: 'ARCHIVED', updatedBy: actorId },
    });

    await this.audit.log({
      actorId,
      action: 'ARCHIVE',
      entityType: 'Content',
      entityId: id,
      req,
    });

    return content;
  }

  async unarchive(id: string, actorId: string, req: Request) {
    await this.findOne(id);

    const content = await this.prisma.content.update({
      where: { id },
      data: { status: 'DRAFT', updatedBy: actorId },
    });

    await this.audit.log({
      actorId,
      action: 'UNARCHIVE',
      entityType: 'Content',
      entityId: id,
      req,
    });

    return content;
  }

  async duplicate(id: string, actorId: string, req: Request) {
    const original = await this.findOne(id);

    const content = await this.prisma.content.create({
      data: {
        title: `${original.title} (copy)`,
        description: original.description,
        tags: original.tags,
        skills: original.skills,
        level: original.level,
        duration: original.duration,
        isPremium: original.isPremium,
        coverKey: original.coverKey,
        videoKey: original.videoKey,
        status: 'DRAFT',
        createdBy: actorId,
        updatedBy: actorId,
      },
    });

    await this.audit.log({
      actorId,
      action: 'DUPLICATE',
      entityType: 'Content',
      entityId: content.id,
      diff: { originalId: id },
      req,
    });

    return content;
  }

  async remove(id: string, actorId: string, req: Request) {
    await this.findOne(id);

    await this.prisma.content.update({
      where: { id },
      data: { status: 'ARCHIVED', updatedBy: actorId },
    });

    await this.audit.log({
      actorId,
      action: 'SOFT_DELETE',
      entityType: 'Content',
      entityId: id,
      req,
    });

    return { message: 'Content archived (soft deleted)' };
  }
}
