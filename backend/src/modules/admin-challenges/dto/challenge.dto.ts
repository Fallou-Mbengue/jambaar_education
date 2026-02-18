import { IsString, IsOptional, IsBoolean, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ContentStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CreateChallengeDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverKey?: string;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;
}

export class UpdateChallengeDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverKey?: string;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}

export class UpdateChallengeDayDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  exercise?: string;

  @IsOptional()
  @IsString()
  validationRule?: string;
}

export class ChallengeFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;
}
