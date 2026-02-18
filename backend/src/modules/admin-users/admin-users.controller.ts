import {
  Controller, Get, Patch, Post, Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminUsersService } from './admin-users.service';
import {
  UserFilterDto, ChangeRoleDto, ChangeStatusDto,
  AdjustGamificationDto, GrantPremiumDto, RevokePremiumDto,
} from './dto/user.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('Admin - Users')
@Controller('dashboard/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminUsersController {
  constructor(private service: AdminUsersService) {}

  @Get()
  @Roles(Role.ADMIN, Role.COACH)
  @ApiOperation({ summary: 'List users with filters and pagination' })
  findAll(@Query() filter: UserFilterDto) {
    return this.service.findAll(filter);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.COACH)
  @ApiOperation({ summary: 'Get user detail with all relations' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/role')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Change user role' })
  changeRole(@Param('id') id: string, @Body() dto: ChangeRoleDto, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.changeRole(id, dto, actorId, req);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Suspend or unsuspend user' })
  changeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.changeStatus(id, dto, actorId, req);
  }

  @Post(':id/gamification/adjust')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Adjust XP or reset streak (requires reason)' })
  adjustGamification(@Param('id') id: string, @Body() dto: AdjustGamificationDto, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.adjustGamification(id, dto, actorId, req);
  }

  @Post(':id/premium/grant')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Grant premium access for N days' })
  grantPremium(@Param('id') id: string, @Body() dto: GrantPremiumDto, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.grantPremium(id, dto, actorId, req);
  }

  @Post(':id/premium/revoke')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Revoke premium access' })
  revokePremium(@Param('id') id: string, @Body() dto: RevokePremiumDto, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.revokePremium(id, dto, actorId, req);
  }
}
