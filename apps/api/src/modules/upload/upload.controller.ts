import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { MinioService } from '../../minio/minio.service';
import { Roles } from '../../common/decorators/roles.decorator';

class PresignDto {
  @IsString()
  filename: string;

  @IsString()
  contentType: string;

  @IsOptional()
  @IsString()
  prefix?: string;
}

class ConfirmDto {
  @IsString()
  objectKey: string;
}

@ApiTags('upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(private minio: MinioService) {}

  @Post('presign')
  @Roles('ADMIN', 'COACH')
  @ApiOperation({ summary: 'Get presigned upload URL (admin/coach)' })
  async presign(@Body() dto: PresignDto) {
    return this.minio.getPresignedUploadUrl(dto.filename, dto.contentType, dto.prefix ?? 'uploads');
  }

  @Post('confirm')
  @Roles('ADMIN', 'COACH')
  @ApiOperation({ summary: 'Confirm upload and get read URL' })
  async confirm(@Body() dto: ConfirmDto) {
    const exists = await this.minio.objectExists(dto.objectKey);
    if (!exists) {
      return { valid: false, message: 'Object not found in storage' };
    }
    const readUrl = await this.minio.getPresignedReadUrl(dto.objectKey);
    return { valid: true, objectKey: dto.objectKey, readUrl };
  }
}
