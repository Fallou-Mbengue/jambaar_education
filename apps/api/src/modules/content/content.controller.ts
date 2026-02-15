import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { CreateContentDto, UpdateContentDto, UpdateProgressDto } from './dto/content.dto';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('content')
@ApiBearerAuth()
@Controller('content')
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Get('saved')
  @ApiOperation({ summary: 'Get saved content' })
  getSaved(@CurrentUser() user: JwtPayload) {
    return this.contentService.getSaved(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get content by ID' })
  findById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.contentService.findById(id, user.sub);
  }

  @Post(':id/progress')
  @ApiOperation({ summary: 'Update watch progress' })
  updateProgress(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.contentService.updateProgress(id, user.sub, dto);
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Toggle like' })
  toggleLike(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.contentService.toggleLike(id, user.sub);
  }

  @Post(':id/save')
  @ApiOperation({ summary: 'Toggle save' })
  toggleSave(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.contentService.toggleSave(id, user.sub);
  }

  @Post(':id/share')
  @ApiOperation({ summary: 'Log share' })
  share(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body('platform') platform: string,
  ) {
    return this.contentService.share(id, user.sub, platform);
  }
}
