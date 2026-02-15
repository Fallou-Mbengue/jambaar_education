import { Controller, Get, Post, Body, Param, Req, Query, RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsEnum } from 'class-validator';
import { Request } from 'express';
import { BillingService } from './billing.service';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

class SubscribeDto {
  @IsString()
  planId: string;

  @IsEnum(['WAVE', 'ORANGE_MONEY'])
  provider: 'WAVE' | 'ORANGE_MONEY';

  @IsString()
  phoneNumber: string;
}

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get subscription plans' })
  getPlans() {
    return this.billingService.getPlans();
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to a plan' })
  subscribe(@CurrentUser() user: JwtPayload, @Body() dto: SubscribeDto) {
    return this.billingService.subscribe(user.sub, dto);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get subscription status' })
  getStatus(@CurrentUser() user: JwtPayload) {
    return this.billingService.getSubscriptionStatus(user.sub);
  }

  @Get('payment/:id')
  @ApiOperation({ summary: 'Get payment status' })
  getPaymentStatus(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.billingService.getPaymentStatus(id, user.sub);
  }

  @Post('webhook/wave')
  @Public()
  @ApiOperation({ summary: 'Wave webhook' })
  waveWebhook(@Req() req: Request) {
    return this.billingService.handleWebhook('WAVE', JSON.stringify(req.body));
  }

  @Post('webhook/orange-money')
  @Public()
  @ApiOperation({ summary: 'Orange Money webhook' })
  omWebhook(@Req() req: Request) {
    return this.billingService.handleWebhook('ORANGE_MONEY', JSON.stringify(req.body));
  }

  @Post('payment/:id/simulate-success')
  @ApiOperation({ summary: 'Simulate payment success (dev only)' })
  simulateSuccess(@Param('id') id: string) {
    return this.billingService.simulatePaymentSuccess(id);
  }

  @Get('admin/subscriptions')
  @Roles('ADMIN', 'COACH')
  @ApiOperation({ summary: 'List all subscriptions (admin)' })
  listSubscriptions(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.billingService.listSubscriptions({
      status,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }
}
