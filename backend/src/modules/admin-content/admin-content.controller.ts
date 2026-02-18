import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminContentService } from './admin-content.service';
import { CreateContentDto, UpdateContentDto, ContentFilterDto } from './dto/content.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('Admin - Content')
@Controller('dashboard/content')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminContentController {
  constructor(private contentService: AdminContentService) {}

  @Get()
  @Roles(Role.ADMIN, Role.COACH)
  @ApiOperation({ summary: 'List content with filters and pagination' })
  async findAll(@Query() filter: ContentFilterDto) {
    return this.contentService.findAll(filter);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.COACH)
  @ApiOperation({ summary: 'Get content by ID' })
  async findOne(@Param('id') id: string) {
    return this.contentService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create new content' })
  async create(
    @Body() dto: CreateContentDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    return this.contentService.create(dto, actorId, req);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update content' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateContentDto,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    return this.contentService.update(id, dto, actorId, req);
  }

  @Post(':id/publish')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Publish content' })
  async publish(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    return this.contentService.publish(id, actorId, req);
  }

  @Post(':id/archive')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Archive content' })
  async archive(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    return this.contentService.archive(id, actorId, req);
  }

  @Post(':id/unarchive')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Unarchive content' })
  async unarchive(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    return this.contentService.unarchive(id, actorId, req);
  }

  @Post(':id/duplicate')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Duplicate content' })
  async duplicate(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    return this.contentService.duplicate(id, actorId, req);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Soft delete content (archive)' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
    @Req() req: Request,
  ) {
    return this.contentService.remove(id, actorId, req);
  }
}
