import { Controller, Post, Put, Get, Body, Param, Req, Res, HttpException, HttpStatus, UseInterceptors, UploadedFile, RawBodyRequest } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { MinioService } from '../../minio/minio.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

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
  @Public() // TEMP: Allow unauthenticated uploads for development
  @ApiOperation({ summary: 'Get presigned upload URL (authenticated users)' })
  async presign(@Body() dto: PresignDto) {
    return this.minio.getPresignedUploadUrl(dto.filename, dto.contentType, dto.prefix ?? 'uploads');
  }

  @Post('confirm')
  @Public() // TEMP: Allow unauthenticated uploads for development
  @ApiOperation({ summary: 'Confirm upload and get read URL' })
  async confirm(@Body() dto: ConfirmDto) {
    const exists = await this.minio.objectExists(dto.objectKey);
    if (!exists) {
      return { valid: false, message: 'Object not found in storage' };
    }
    const readUrl = await this.minio.getPresignedReadUrl(dto.objectKey);
    return { valid: true, objectKey: dto.objectKey, readUrl };
  }

  @Put('local/:objectKey(*)')
  @Public()
  @ApiOperation({ summary: 'Local file upload (dev fallback when MinIO is unavailable)' })
  async localUpload(
    @Param('objectKey') objectKey: string,
    @Req() req: Request,
  ) {
    if (!this.minio.isLocalMode()) {
      throw new HttpException('Local upload not available', HttpStatus.NOT_FOUND);
    }

    const decoded = decodeURIComponent(objectKey);
    const filePath = path.join(this.minio.getLocalDir(), decoded);
    const dir = path.dirname(filePath);

    // Create directory if it doesn't exist
    fs.mkdirSync(dir, { recursive: true });

    try {
      // Get buffer from body (express.raw() stores it in req.body as Buffer)
      const buffer = req.body as Buffer;

      if (!buffer || !Buffer.isBuffer(buffer)) {
        throw new HttpException('No file data received', HttpStatus.BAD_REQUEST);
      }

      // Write file to disk
      fs.writeFileSync(filePath, buffer);

      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to write file';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('local/:objectKey(*)')
  @Public()
  @ApiOperation({ summary: 'Serve locally stored file (dev fallback)' })
  async localRead(
    @Param('objectKey') objectKey: string,
    @Res() res: Response,
  ) {
    if (!this.minio.isLocalMode()) {
      throw new HttpException('Local storage not available', HttpStatus.NOT_FOUND);
    }

    const decoded = decodeURIComponent(objectKey);
    const filePath = path.join(this.minio.getLocalDir(), decoded);
    if (!fs.existsSync(filePath)) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.pdf': 'application/pdf',
    };

    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  }
}
