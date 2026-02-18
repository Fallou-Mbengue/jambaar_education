import { IsString, IsOptional, IsInt, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CreateQuizDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  contentId?: string;

  @IsOptional()
  @IsString()
  moduleId?: string;
}

export class UpdateQuizDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  contentId?: string;

  @IsOptional()
  @IsString()
  moduleId?: string;
}

export class CreateQuestionDto {
  @IsString()
  question: string;

  @IsArray()
  choices: string[];

  @IsInt()
  @Min(0)
  correctAnswer: number;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsArray()
  choices?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  correctAnswer?: number;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}

export class QuizFilterDto extends PaginationDto {}
