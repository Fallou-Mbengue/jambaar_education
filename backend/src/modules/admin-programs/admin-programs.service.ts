import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminAuditService } from '../admin-audit/admin-audit.service';
import {
  CreateProgramDto,
  UpdateProgramDto,
  AttachModulesDto,
  ReorderModulesDto,
  ProgramFilterDto,
  CreateModuleDto,
} from './dto/program.dto';
import { buildPaginatedResponse } from '../../common/dto/pagination.dto';
import { Request } from 'express';

@Injectable()
export class AdminProgramsService {
  constructor(
    private prisma: PrismaService,
    private audit: AdminAuditService,
  ) {}

  async findAll(filter: ProgramFilterDto) {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filter.q) {
      where.title = { contains: filter.q, mode: 'insensitive' };
    }
    if (filter.status) where.status = filter.status;
    if (filter.isPremium !== undefined) where.isPremium = filter.isPremium;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.program.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          modules: {
            orderBy: { order: 'asc' },
            include: { module: { select: { id: true, title: true } } },
          },
          _count: { select: { modules: true } },
        },
      }),
      this.prisma.program.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, pageSize);
  }

  async findOne(id: string) {
    const program = await this.prisma.program.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: { module: true },
        },
      },
    });
    if (!program) throw new NotFoundException('Program not found');
    return program;
  }

  async create(dto: CreateProgramDto, actorId: string, req: Request) {
    const program = await this.prisma.program.create({
      data: { ...dto, createdBy: actorId, updatedBy: actorId },
    });

    await this.audit.log({
      actorId,
      action: 'CREATE',
      entityType: 'Program',
      entityId: program.id,
      diff: dto,
      req,
    });

    return program;
  }

  async update(id: string, dto: UpdateProgramDto, actorId: string, req: Request) {
    await this.findOne(id);
    const program = await this.prisma.program.update({
      where: { id },
      data: { ...dto, updatedBy: actorId },
    });

    await this.audit.log({
      actorId,
      action: 'UPDATE',
      entityType: 'Program',
      entityId: id,
      diff: dto,
      req,
    });

    return program;
  }

  async remove(id: string, actorId: string, req: Request) {
    await this.findOne(id);
    await this.prisma.program.update({
      where: { id },
      data: { status: 'ARCHIVED', updatedBy: actorId },
    });

    await this.audit.log({
      actorId,
      action: 'SOFT_DELETE',
      entityType: 'Program',
      entityId: id,
      req,
    });

    return { message: 'Program archived' };
  }

  async attachModules(id: string, dto: AttachModulesDto, actorId: string, req: Request) {
    await this.findOne(id);

    const existing = await this.prisma.programModule.findMany({
      where: { programId: id },
      orderBy: { order: 'desc' },
    });
    let nextOrder = existing.length > 0 ? existing[0].order + 1 : 0;

    await this.prisma.$transaction(
      dto.moduleIds.map((moduleId) =>
        this.prisma.programModule.upsert({
          where: { programId_moduleId: { programId: id, moduleId } },
          create: { programId: id, moduleId, order: nextOrder++ },
          update: {},
        }),
      ),
    );

    await this.audit.log({
      actorId,
      action: 'ATTACH_MODULES',
      entityType: 'Program',
      entityId: id,
      diff: { moduleIds: dto.moduleIds },
      req,
    });

    return this.findOne(id);
  }

  async reorderModules(id: string, dto: ReorderModulesDto, actorId: string, req: Request) {
    await this.findOne(id);

    await this.prisma.$transaction(
      dto.orders.map((item) =>
        this.prisma.programModule.updateMany({
          where: { programId: id, moduleId: item.moduleId },
          data: { order: item.order },
        }),
      ),
    );

    await this.audit.log({
      actorId,
      action: 'REORDER_MODULES',
      entityType: 'Program',
      entityId: id,
      diff: dto.orders,
      req,
    });

    return this.findOne(id);
  }

  async createModule(dto: CreateModuleDto, actorId: string, req: Request) {
    const mod = await this.prisma.module.create({
      data: { ...dto, createdBy: actorId, updatedBy: actorId },
    });

    await this.audit.log({
      actorId,
      action: 'CREATE',
      entityType: 'Module',
      entityId: mod.id,
      diff: dto,
      req,
    });

    return mod;
  }

  async listModules() {
    return this.prisma.module.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
