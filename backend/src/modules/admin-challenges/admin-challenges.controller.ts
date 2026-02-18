import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Req, ParseIntPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminChallengesService } from './admin-challenges.service';
import {
  CreateChallengeDto, UpdateChallengeDto,
  UpdateChallengeDayDto, ChallengeFilterDto,
} from './dto/challenge.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('Admin - Challenges')
@Controller('dashboard/challenges')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminChallengesController {
  constructor(private service: AdminChallengesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.COACH)
  @ApiOperation({ summary: 'List challenges' })
  findAll(@Query() filter: ChallengeFilterDto) {
    return this.service.findAll(filter);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.COACH)
  @ApiOperation({ summary: 'Get challenge by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create challenge with 7 days' })
  create(@Body() dto: CreateChallengeDto, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.create(dto, actorId, req);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update challenge' })
  update(@Param('id') id: string, @Body() dto: UpdateChallengeDto, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.update(id, dto, actorId, req);
  }

  @Patch(':id/days/:dayNumber')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update challenge day' })
  updateDay(
    @Param('id') id: string,
    @Param('dayNumber', ParseIntPipe) dayNumber: number,
    @Body() dto: UpdateChallengeDayDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    return this.service.updateDay(id, dayNumber, dto, actorId, req);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Archive challenge' })
  remove(@Param('id') id: string, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.remove(id, actorId, req);
  }
}
