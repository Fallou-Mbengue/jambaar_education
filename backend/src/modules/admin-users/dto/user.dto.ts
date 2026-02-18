import { IsString, IsOptional, IsEnum, IsBoolean, IsInt, Min } from 'class-validator';
import { Role, UserStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class UserFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;
}

export class ChangeRoleDto {
  @IsEnum(Role)
  role: Role;
}

export class ChangeStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;
}

export class AdjustGamificationDto {
  @IsOptional()
  @IsInt()
  xpDelta?: number;

  @IsOptional()
  @IsBoolean()
  resetStreak?: boolean;

  @IsString()
  reason: string;
}

export class GrantPremiumDto {
  @IsInt()
  @Min(1)
  days: number;

  @IsString()
  reason: string;
}

export class RevokePremiumDto {
  @IsString()
  reason: string;
}
