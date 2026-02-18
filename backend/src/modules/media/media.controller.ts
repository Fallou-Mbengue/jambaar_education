import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { MediaService } from './media.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { Role } from '@prisma/client';

class PresignDto {
  @IsString()
  folder: string;

  @IsString()
  filename: string;

  @IsString()
  contentType: string;
}

@ApiTags('Media')
@Controller('dashboard/media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.COACH)
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('presign')
  @ApiOperation({ summary: 'Get presigned upload URL' })
  async presign(@Body() dto: PresignDto) {
    return this.mediaService.getPresignedUploadUrl(dto.folder, dto.filename, dto.contentType);
  }
}
