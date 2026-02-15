import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsObject } from 'class-validator';
import { AnalyticsService } from './analytics.service';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

class TrackEventDto {
  @IsString()
  eventName: string;

  @IsOptional()
  @IsObject()
  properties?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  sessionId?: string;
}

class BatchTrackDto {
  @IsArray()
  events: TrackEventDto[];
}

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('track')
  @ApiOperation({ summary: 'Track an event' })
  track(@CurrentUser() user: JwtPayload, @Body() dto: TrackEventDto) {
    return this.analyticsService.track({ ...dto, userId: user.sub });
  }

  @Post('batch-track')
  @ApiOperation({ summary: 'Track multiple events' })
  batchTrack(@CurrentUser() user: JwtPayload, @Body() dto: BatchTrackDto) {
    return this.analyticsService.batchTrack(user.sub, dto.events);
  }
}
