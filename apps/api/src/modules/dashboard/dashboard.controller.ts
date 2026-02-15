import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@Roles('ADMIN', 'COACH')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'Get platform KPIs' })
  getKpis() {
    return this.dashboardService.getKpis();
  }

  @Get('users')
  @ApiOperation({ summary: 'List users with progress (dashboard)' })
  getUserProgress(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.dashboardService.getUserProgress({
      search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('users/:id/skills')
  @ApiOperation({ summary: 'Get soft skill scores for a user' })
  getUserSkills(@Param('id') id: string) {
    return this.dashboardService.getUserSoftSkillScores(id);
  }

  @Get('content')
  @ApiOperation({ summary: 'Content catalogue (admin)' })
  getContent(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.dashboardService.getContentList({
      status, type, search,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }
}
