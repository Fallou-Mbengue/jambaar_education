import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { NotificationSegment } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CreateNotificationDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  deepLink?: string;

  @IsEnum(NotificationSegment)
  segment: NotificationSegment;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];

  @IsOptional()
  @IsString()
  challengeId?: string;
}

export class NotificationFilterDto extends PaginationDto {}
