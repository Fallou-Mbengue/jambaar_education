import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminAnalyticsService } from './admin-analytics.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

@ApiTags('Admin - Analytics')
@Controller('dashboard/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.COACH)
export class AdminAnalyticsController {
  constructor(private service: AdminAnalyticsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get dashboard overview KPIs' })
  getOverview() {
    return this.service.getOverview();
  }

  @Get('activation')
  @ApiOperation({ summary: 'Get activation metrics' })
  getActivation() {
    return this.service.getActivation();
  }

  @Get('retention')
  @ApiOperation({ summary: 'Get retention metrics' })
  getRetention() {
    return this.service.getRetention();
  }
}
