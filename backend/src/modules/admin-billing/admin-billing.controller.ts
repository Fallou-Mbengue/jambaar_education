import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AdminBillingService } from './admin-billing.service';
import {
  CreatePlanDto, UpdatePlanDto, PlanFilterDto,
  SubscriptionFilterDto, ExtendSubscriptionDto, PaymentFilterDto,
} from './dto/billing.dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';

@ApiTags('Admin - Billing')
@Controller('dashboard/billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminBillingController {
  constructor(private service: AdminBillingService) {}

  // Plans
  @Get('plans')
  @Roles(Role.ADMIN, Role.COACH)
  @ApiOperation({ summary: 'List subscription plans' })
  findAllPlans(@Query() filter: PlanFilterDto) {
    return this.service.findAllPlans(filter);
  }

  @Post('plans')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create subscription plan' })
  createPlan(@Body() dto: CreatePlanDto, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.createPlan(dto, actorId, req);
  }

  @Patch('plans/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update subscription plan' })
  updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.updatePlan(id, dto, actorId, req);
  }

  @Delete('plans/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Deactivate subscription plan' })
  deletePlan(@Param('id') id: string, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.deletePlan(id, actorId, req);
  }

  // Subscriptions
  @Get('subscriptions')
  @Roles(Role.ADMIN, Role.COACH)
  @ApiOperation({ summary: 'List subscriptions' })
  findAllSubscriptions(@Query() filter: SubscriptionFilterDto) {
    return this.service.findAllSubscriptions(filter);
  }

  @Patch('subscriptions/:id/cancel')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cancel subscription' })
  cancelSubscription(@Param('id') id: string, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.cancelSubscription(id, actorId, req);
  }

  @Patch('subscriptions/:id/extend')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Extend subscription by N days' })
  extendSubscription(@Param('id') id: string, @Body() dto: ExtendSubscriptionDto, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.extendSubscription(id, dto, actorId, req);
  }

  // Payments
  @Get('payments')
  @Roles(Role.ADMIN, Role.COACH)
  @ApiOperation({ summary: 'List payments' })
  findAllPayments(@Query() filter: PaymentFilterDto) {
    return this.service.findAllPayments(filter);
  }

  @Post('payments/:id/reconcile')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Reconcile pending payment to success' })
  reconcilePayment(@Param('id') id: string, @CurrentUser('id') actorId: string, @Req() req: Request) {
    return this.service.reconcilePayment(id, actorId, req);
  }
}
