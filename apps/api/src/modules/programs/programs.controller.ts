import { Controller, Get, Post, Body, Param, Query, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProgramsService } from './programs.service';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CreateProgramDto, UpdateProgramDto } from './dto/create-program.dto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('programs')
@ApiBearerAuth()
@Controller('programs')
export class ProgramsController {
  constructor(private programsService: ProgramsService) {}

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'List all programs (public, no auth required)' })
  findAllPublic() {
    return this.programsService.findAllPublic();
  }

  @Get('public/:id')
  @Public()
  @ApiOperation({ summary: 'Get program details (public, no auth required)' })
  findByIdPublic(@Param('id') id: string) {
    return this.programsService.findByIdPublic(id);
  }

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

  @Post('admin/create')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'COACH')
  @ApiOperation({ summary: 'Create a new program with modules (Admin/Coach only)' })
  createProgramAdmin(@Body() dto: CreateProgramDto) {
    return this.programsService.createProgramWithModules({
      title: dto.title,
      description: dto.description,
      category: dto.category,
      difficulty: dto.difficulty,
      thumbnailKey: dto.thumbnailKey,
      modules: dto.modules?.map((m) => ({
        title: m.title,
        description: m.description,
        lessons: m.lessons.map((l) => ({
          title: l.title,
          type: l.type,
          description: l.description,
          durationSeconds: l.durationSeconds,
          isFreePreview: l.isFreePreview,
          videoKey: l.videoKey,
          pdfKey: l.pdfKey,
          exerciseBody: l.exerciseBody,
        })),
      })),
      price: dto.price,
      isFree: dto.isFree,
      accessDuration: dto.accessDuration,
      hasCertification: dto.hasCertification,
      paywallLessonIndex: dto.paywallLessonIndex,
      tags: dto.tags,
    });
  }

  @Patch('admin/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'COACH')
  @ApiOperation({ summary: 'Update program details (Admin/Coach only)' })
  updateProgramAdmin(@Param('id') id: string, @Body() dto: UpdateProgramDto) {
    return this.programsService.updateProgramDetails(id, {
      title: dto.title,
      description: dto.description,
      category: dto.category,
      difficulty: dto.difficulty,
      thumbnailKey: dto.thumbnailKey,
      price: dto.price,
      isFree: dto.isFree,
      accessDuration: dto.accessDuration,
      hasCertification: dto.hasCertification,
      tags: dto.tags,
    });
  }

  @Post('admin/:id/publish')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'COACH')
  @ApiOperation({ summary: 'Publish a program (Admin/Coach only)' })
  publishProgram(@Param('id') id: string) {
    return this.programsService.publishProgram(id);
  }

  @Delete('admin/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'COACH')
  @ApiOperation({ summary: 'Delete a draft program (Admin/Coach only)' })
  deleteDraftProgram(@Param('id') id: string) {
    return this.programsService.deleteDraft(id);
  }
}
