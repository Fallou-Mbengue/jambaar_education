import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private client!: Minio.Client;
  private bucket!: string;
  private useLocalStorage = false;
  private localDir!: string;
  private apiPort!: number;

  constructor(private config: ConfigService) {}

  private get(key: string, fallback: string | number): string | number {
    return this.config?.get(key) ?? process.env[key] ?? fallback;
  }

  async onModuleInit() {
    this.bucket = this.get('MINIO_BUCKET', 'jambaar') as string;
    this.apiPort = Number(this.get('API_PORT', 3001));
    this.localDir = path.resolve(process.cwd(), 'uploads');

    this.client = new Minio.Client({
      endPoint: this.get('MINIO_ENDPOINT', 'localhost') as string,
      port: Number(this.get('MINIO_PORT', 9000)),
      useSSL: String(this.get('MINIO_USE_SSL', 'false')) === 'true',
      accessKey: this.get('MINIO_ACCESS_KEY', 'minioadmin') as string,
      secretKey: this.get('MINIO_SECRET_KEY', 'minioadmin') as string,
    });

    const minioOk = await this.ensureBucket();
    if (!minioOk) {
      this.useLocalStorage = true;
      fs.mkdirSync(this.localDir, { recursive: true });
      this.logger.warn(
        `MinIO unavailable – falling back to local file storage at ${this.localDir}`,
      );
    }
  }

  private async ensureBucket(): Promise<boolean> {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket, 'us-east-1');
        this.logger.log(`Bucket '${this.bucket}' created`);
      }
      return true;
    } catch (err) {
      this.logger.error('Failed to ensure MinIO bucket', err);
      return false;
    }
  }

  generateObjectKey(filename: string, prefix = 'uploads'): string {
    const ext = filename.split('.').pop();
    return `${prefix}/${uuidv4()}${ext ? '.' + ext : ''}`;
  }

  async getPresignedUploadUrl(
    filename: string,
    contentType: string,
    prefix = 'uploads',
    expirySeconds = 600,
  ): Promise<{ presignedUrl: string; objectKey: string }> {
    const objectKey = this.generateObjectKey(filename, prefix);

    if (this.useLocalStorage) {
      // Use relative path so requests go through Next.js proxy (avoids CORS + 404)
      const uploadUrl = `/api/v1/upload/local/${encodeURIComponent(objectKey)}`;
      return { presignedUrl: uploadUrl, objectKey };
    }

    const presignedUrl = await this.client.presignedPutObject(
      this.bucket,
      objectKey,
      expirySeconds,
    );
    return { presignedUrl, objectKey };
  }

  async getPresignedReadUrl(objectKey: string, expirySeconds = 3600): Promise<string> {
    if (this.useLocalStorage) {
      return `/api/v1/upload/local/${encodeURIComponent(objectKey)}`;
    }
    return this.client.presignedGetObject(this.bucket, objectKey, expirySeconds);
  }

  async objectExists(objectKey: string): Promise<boolean> {
    if (this.useLocalStorage) {
      return fs.existsSync(path.join(this.localDir, objectKey));
    }
    try {
      await this.client.statObject(this.bucket, objectKey);
      return true;
    } catch {
      return false;
    }
  }

  async deleteObject(objectKey: string): Promise<void> {
    if (this.useLocalStorage) {
      const filePath = path.join(this.localDir, objectKey);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return;
    }
    await this.client.removeObject(this.bucket, objectKey);
  }

  async getPublicUrl(objectKey: string): Promise<string> {
    if (this.useLocalStorage) {
      return `/api/v1/upload/local/${encodeURIComponent(objectKey)}`;
    }
    const endpoint = this.get('MINIO_ENDPOINT', 'localhost') as string;
    const port = Number(this.get('MINIO_PORT', 9000));
    const ssl = String(this.get('MINIO_USE_SSL', 'false')) === 'true';
    const protocol = ssl ? 'https' : 'http';
    return `${protocol}://${endpoint}:${port}/${this.bucket}/${objectKey}`;
  }

  isLocalMode(): boolean {
    return this.useLocalStorage;
  }

  getLocalDir(): string {
    return this.localDir;
  }
}
