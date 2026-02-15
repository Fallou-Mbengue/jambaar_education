import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChallengesService } from './challenges.service';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('challenges')
@ApiBearerAuth()
@Controller('challenges')
export class ChallengesController {
  constructor(private challengesService: ChallengesService) {}

  @Get()
  @ApiOperation({ summary: 'List challenges' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.challengesService.findAll(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get challenge details' })
  findById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.challengesService.findById(id, user.sub);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a challenge' })
  join(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.challengesService.join(id, user.sub);
  }

  @Post(':id/validate-day')
  @ApiOperation({ summary: 'Validate a challenge day' })
  validateDay(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body('dayNumber') dayNumber: number,
  ) {
    return this.challengesService.validateDay(id, user.sub, dayNumber);
  }
}
