import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService implements OnModuleInit {
  private client: Minio.Client;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.bucket = this.config.get<string>('MINIO_BUCKET') || 'jambaar-media';
    this.client = new Minio.Client({
      endPoint: this.config.get<string>('MINIO_ENDPOINT') || 'localhost',
      port: parseInt(this.config.get<string>('MINIO_PORT') || '9000', 10),
      useSSL: this.config.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.config.get<string>('MINIO_ACCESS_KEY') || 'minioadmin',
      secretKey: this.config.get<string>('MINIO_SECRET_KEY') || 'minioadmin',
    });
  }

  async onModuleInit() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket);
      }
    } catch {
      console.warn('MinIO not available - media uploads will fail');
    }
  }

  async getPresignedUploadUrl(
    folder: string,
    filename: string,
    contentType: string,
  ): Promise<{ url: string; key: string }> {
    const ext = filename.split('.').pop();
    const key = `${folder}/${uuidv4()}.${ext}`;

    const url = await this.client.presignedPutObject(this.bucket, key, 60 * 15);

    return { url, key };
  }

  async getPresignedDownloadUrl(key: string): Promise<string> {
    return this.client.presignedGetObject(this.bucket, key, 60 * 60);
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key);
  }
}
