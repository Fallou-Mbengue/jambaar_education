import { IsString, IsOptional, IsBoolean, IsArray, IsEnum, IsInt, Min } from 'class-validator';
import { ContentStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CreateProgramDto {
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

export class UpdateProgramDto {
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

export class AttachModulesDto {
  @IsArray()
  @IsString({ each: true })
  moduleIds: string[];
}

export class ReorderModulesDto {
  @IsArray()
  orders: { moduleId: string; order: number }[];
}

export class ProgramFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;
}

export class CreateModuleDto {
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

  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;
}
