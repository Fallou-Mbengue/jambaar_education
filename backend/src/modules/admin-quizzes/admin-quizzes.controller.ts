import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminQuizzesService } from './admin-quizzes.service';
import {
  CreateQuizDto, UpdateQuizDto,
  CreateQuestionDto, UpdateQuestionDto, QuizFilterDto,
} from './dto/quiz.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('Admin - Quizzes')
@Controller('dashboard/quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminQuizzesController {
  constructor(private service: AdminQuizzesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.COACH)
  @ApiOperation({ summary: 'List quizzes' })
  findAll(@Query() filter: QuizFilterDto) {
    return this.service.findAll(filter);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.COACH)
  @ApiOperation({ summary: 'Get quiz by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create quiz' })
  create(@Body() dto: CreateQuizDto, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.create(dto, actorId, req);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update quiz' })
  update(@Param('id') id: string, @Body() dto: UpdateQuizDto, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.update(id, dto, actorId, req);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Archive quiz' })
  remove(@Param('id') id: string, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.remove(id, actorId, req);
  }

  @Post(':id/questions')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Add question to quiz' })
  addQuestion(@Param('id') id: string, @Body() dto: CreateQuestionDto, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.addQuestion(id, dto, actorId, req);
  }

  @Patch(':id/questions/:questionId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update quiz question' })
  updateQuestion(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
    @Body() dto: UpdateQuestionDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    return this.service.updateQuestion(id, questionId, dto, actorId, req);
  }

  @Delete(':id/questions/:questionId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete quiz question' })
  removeQuestion(
    @Param('id') id: string,
    @Param('questionId') questionId: string,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    return this.service.removeQuestion(id, questionId, actorId, req);
  }
}
