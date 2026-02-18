import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminAuditService } from '../admin-audit/admin-audit.service';
import {
  CreateQuizDto, UpdateQuizDto,
  CreateQuestionDto, UpdateQuestionDto, QuizFilterDto,
} from './dto/quiz.dto';
import { buildPaginatedResponse } from '../../common/dto/pagination.dto';
import { Request } from 'express';

@Injectable()
export class AdminQuizzesService {
  constructor(
    private prisma: PrismaService,
    private audit: AdminAuditService,
  ) {}

  async findAll(filter: QuizFilterDto) {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filter.q) where.title = { contains: filter.q, mode: 'insensitive' };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.quiz.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          content: { select: { id: true, title: true } },
          module: { select: { id: true, title: true } },
          _count: { select: { questions: true, attempts: true } },
        },
      }),
      this.prisma.quiz.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, pageSize);
  }

  async findOne(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: 'asc' } },
        content: { select: { id: true, title: true } },
        module: { select: { id: true, title: true } },
        _count: { select: { attempts: true } },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async create(dto: CreateQuizDto, actorId: string, req: Request) {
    const quiz = await this.prisma.quiz.create({
      data: { ...dto, createdBy: actorId, updatedBy: actorId },
    });

    await this.audit.log({ actorId, action: 'CREATE', entityType: 'Quiz', entityId: quiz.id, diff: dto, req });
    return quiz;
  }

  async update(id: string, dto: UpdateQuizDto, actorId: string, req: Request) {
    await this.findOne(id);
    const quiz = await this.prisma.quiz.update({
      where: { id },
      data: { ...dto, updatedBy: actorId },
    });

    await this.audit.log({ actorId, action: 'UPDATE', entityType: 'Quiz', entityId: id, diff: dto, req });
    return quiz;
  }

  async remove(id: string, actorId: string, req: Request) {
    await this.findOne(id);
    await this.prisma.quiz.update({
      where: { id },
      data: { status: 'ARCHIVED', updatedBy: actorId },
    });

    await this.audit.log({ actorId, action: 'SOFT_DELETE', entityType: 'Quiz', entityId: id, req });
    return { message: 'Quiz archived' };
  }

  async addQuestion(quizId: string, dto: CreateQuestionDto, actorId: string, req: Request) {
    await this.findOne(quizId);
    const question = await this.prisma.quizQuestion.create({
      data: { quizId, ...dto },
    });

    await this.audit.log({ actorId, action: 'ADD_QUESTION', entityType: 'QuizQuestion', entityId: question.id, diff: dto, req });
    return question;
  }

  async updateQuestion(quizId: string, questionId: string, dto: UpdateQuestionDto, actorId: string, req: Request) {
    const question = await this.prisma.quizQuestion.findFirst({
      where: { id: questionId, quizId },
    });
    if (!question) throw new NotFoundException('Question not found');

    const updated = await this.prisma.quizQuestion.update({
      where: { id: questionId },
      data: dto,
    });

    await this.audit.log({ actorId, action: 'UPDATE_QUESTION', entityType: 'QuizQuestion', entityId: questionId, diff: dto, req });
    return updated;
  }

  async removeQuestion(quizId: string, questionId: string, actorId: string, req: Request) {
    const question = await this.prisma.quizQuestion.findFirst({
      where: { id: questionId, quizId },
    });
    if (!question) throw new NotFoundException('Question not found');

    await this.prisma.quizQuestion.delete({ where: { id: questionId } });

    await this.audit.log({ actorId, action: 'DELETE_QUESTION', entityType: 'QuizQuestion', entityId: questionId, req });
    return { message: 'Question deleted' };
  }
}
