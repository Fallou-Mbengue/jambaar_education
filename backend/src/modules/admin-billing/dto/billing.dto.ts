import {
  IsString, IsOptional, IsBoolean, IsEnum, IsInt, IsArray, Min,
} from 'class-validator';
import { PlanInterval, SubscriptionStatus, PaymentStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsEnum(PlanInterval)
  interval: PlanInterval;

  @IsInt()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsInt()
  @Min(1)
  durationDays: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];
}

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(PlanInterval)
  interval?: PlanInterval;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class PlanFilterDto extends PaginationDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SubscriptionFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsString()
  planId?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class ExtendSubscriptionDto {
  @IsInt()
  @Min(1)
  days: number;
}

export class PaymentFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;
}
