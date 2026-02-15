import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProgramsService } from './programs.service';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('programs')
@ApiBearerAuth()
@Controller('programs')
export class ProgramsController {
  constructor(private programsService: ProgramsService) {}

  @Get()
  @ApiOperation({ summary: 'List all programs' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.programsService.findAll(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get program details' })
  findById(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.programsService.findById(id, user.sub);
  }

  @Post(':id/progress')
  @ApiOperation({ summary: 'Update program progress' })
  updateProgress(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body('moduleId') moduleId: string,
  ) {
    return this.programsService.updateProgress(id, user.sub, moduleId);
  }
}
