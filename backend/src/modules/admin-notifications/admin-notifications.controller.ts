import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminNotificationsService } from './admin-notifications.service';
import { CreateNotificationDto, NotificationFilterDto } from './dto/notification.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('Admin - Notifications')
@Controller('dashboard/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminNotificationsController {
  constructor(private service: AdminNotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Send notification to segment' })
  create(@Body() dto: CreateNotificationDto, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.create(dto, actorId, req);
  }

  @Get()
  @ApiOperation({ summary: 'List sent notifications' })
  findAll(@Query() filter: NotificationFilterDto) {
    return this.service.findAll(filter);
  }
}
