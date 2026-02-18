import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';
import { buildPaginatedResponse } from '../../common/dto/pagination.dto';

export interface AuditLogParams {
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string;
  diff?: any;
  reason?: string;
  req?: Request;
}

@Injectable()
export class AdminAuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: AuditLogParams) {
    return this.prisma.adminAuditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        diff: params.diff,
        reason: params.reason,
        ip: params.req?.ip || params.req?.headers?.['x-forwarded-for']?.toString(),
        userAgent: params.req?.headers?.['user-agent'],
      },
    });
  }

  async findAll(query: {
    page?: number;
    pageSize?: number;
    actorId?: string;
    action?: string;
    entityType?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (query.actorId) where.actorId = query.actorId;
    if (query.action) where.action = query.action;
    if (query.entityType) where.entityType = query.entityType;
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.adminAuditLog.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.adminAuditLog.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, pageSize);
  }
}
