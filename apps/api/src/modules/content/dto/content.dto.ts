import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  IsInt,
  IsPositive,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContentDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ enum: ['VIDEO', 'ARTICLE', 'QUIZ', 'MICRO_LEARNING'] })
  @IsEnum(['VIDEO', 'ARTICLE', 'QUIZ', 'MICRO_LEARNING'])
  type: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  durationSeconds?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnailKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  articleBody?: string;
}

export class UpdateContentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] })
  @IsOptional()
  @IsEnum(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnailKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  articleBody?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  durationSeconds?: number;
}

export class UpdateProgressDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  watchedSeconds: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  progressPercent: number;
}
