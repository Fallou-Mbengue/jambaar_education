import { IsString, IsOptional, IsBoolean, IsArray, IsNumber, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ProgramDifficulty {
  DEBUTANT = 'DEBUTANT',
  INTERMEDIAIRE = 'INTERMEDIAIRE',
  AVANCE = 'AVANCE',
}

export enum ProgramCategory {
  DEVELOPPEMENT_WEB = 'DEVELOPPEMENT_WEB',
  ENTREPRENEURIAT = 'ENTREPRENEURIAT',
  SOFT_SKILLS = 'SOFT_SKILLS',
  LEADERSHIP = 'LEADERSHIP',
  MARKETING = 'MARKETING',
  DESIGN = 'DESIGN',
}

export enum LessonType {
  VIDEO = 'VIDEO',
  PDF = 'PDF',
  QUIZ = 'QUIZ',
  EXERCISE = 'EXERCISE',
}

export class CreateLessonDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty({ enum: LessonType })
  @IsEnum(LessonType)
  type: LessonType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  durationSeconds?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFreePreview?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  videoKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pdfKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  exerciseBody?: string;
}

export class CreateModuleDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [CreateLessonDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateLessonDto)
  lessons: CreateLessonDto[];
}

export class CreateProgramDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ProgramCategory })
  @IsEnum(ProgramCategory)
  category: ProgramCategory;

  @ApiProperty({ enum: ProgramDifficulty })
  @IsEnum(ProgramDifficulty)
  difficulty: ProgramDifficulty;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnailKey?: string;

  @ApiPropertyOptional({ type: [CreateModuleDto] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateModuleDto)
  modules?: CreateModuleDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accessDuration?: string; // 'lifetime', '30days', '90days', '1year'

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasCertification?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  paywallLessonIndex?: number; // Index of the first paid lesson

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateProgramDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: ProgramCategory })
  @IsOptional()
  @IsEnum(ProgramCategory)
  category?: ProgramCategory;

  @ApiPropertyOptional({ enum: ProgramDifficulty })
  @IsOptional()
  @IsEnum(ProgramDifficulty)
  difficulty?: ProgramDifficulty;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnailKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accessDuration?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasCertification?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
