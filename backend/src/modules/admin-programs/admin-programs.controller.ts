import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminProgramsService } from './admin-programs.service';
import {
  CreateProgramDto, UpdateProgramDto,
  AttachModulesDto, ReorderModulesDto,
  ProgramFilterDto, CreateModuleDto,
} from './dto/program.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('Admin - Programs')
@Controller('dashboard/programs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminProgramsController {
  constructor(private service: AdminProgramsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.COACH)
  @ApiOperation({ summary: 'List programs' })
  findAll(@Query() filter: ProgramFilterDto) {
    return this.service.findAll(filter);
  }

  @Get('modules')
  @Roles(Role.ADMIN, Role.COACH)
  @ApiOperation({ summary: 'List all modules' })
  listModules() {
    return this.service.listModules();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.COACH)
  @ApiOperation({ summary: 'Get program by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create program' })
  create(@Body() dto: CreateProgramDto, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.create(dto, actorId, req);
  }

  @Post('modules')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new module' })
  createModule(@Body() dto: CreateModuleDto, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.createModule(dto, actorId, req);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update program' })
  update(@Param('id') id: string, @Body() dto: UpdateProgramDto, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.update(id, dto, actorId, req);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Archive program (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.remove(id, actorId, req);
  }

  @Post(':id/modules')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Attach modules to program' })
  attachModules(@Param('id') id: string, @Body() dto: AttachModulesDto, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.attachModules(id, dto, actorId, req);
  }

  @Patch(':id/reorder')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Reorder modules in program' })
  reorderModules(@Param('id') id: string, @Body() dto: ReorderModulesDto, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.reorderModules(id, dto, actorId, req);
  }
}
