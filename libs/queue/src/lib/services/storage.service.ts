import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { StorageConfig, FileDownloadResult } from '../types/queue.types';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const config = this.getStorageConfig();
    this.bucketName = config.bucketName;
    this.s3Client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: config.credentials,
    });
  }

  /**
   * Download a file from storage
   * @param fileKey The key of the file to download
   * @returns File download result with stream and metadata
   */
  async downloadFile(fileKey: string): Promise<FileDownloadResult> {
    try {
      this.logger.log(`Downloading file: ${fileKey}`);

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      const response = await this.s3Client.send(command);

      return {
        stream: response.Body as NodeJS.ReadableStream,
        metadata: response.Metadata,
        contentType: response.ContentType,
        contentLength: response.ContentLength,
      };
    } catch (error) {
      this.logger.error(`Failed to download file ${fileKey}:`, error);
      throw error;
    }
  }

  /**
   * Upload a file to storage
   * @param fileKey The key for the file
   * @param body The file content
   * @param metadata Optional metadata
   * @returns The uploaded file key
   */
  async uploadFile(
    fileKey: string,
    body: Buffer | string,
    metadata?: Record<string, string>
  ): Promise<string> {
    try {
      this.logger.log(`Uploading file: ${fileKey}`);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: body,
        Metadata: metadata,
      });

      await this.s3Client.send(command);
      this.logger.log(`Successfully uploaded file: ${fileKey}`);

      return fileKey;
    } catch (error) {
      this.logger.error(`Failed to upload file ${fileKey}:`, error);
      throw error;
    }
  }

  /**
   * Delete a file from storage
   * @param fileKey The key of the file to delete
   */
  async deleteFile(fileKey: string): Promise<void> {
    try {
      this.logger.log(`Deleting file: ${fileKey}`);

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      await this.s3Client.send(command);
      this.logger.log(`Successfully deleted file: ${fileKey}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${fileKey}:`, error);
      throw error;
    }
  }

  /**
   * Get storage configuration from environment variables
   */
  private getStorageConfig(): StorageConfig {
    const accountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID');
    const bucketName = this.configService.get<string>('CLOUDFLARE_BUCKET_NAME');
    const accessKeyId = this.configService.get<string>(
      'CLOUDFLARE_R2_ACCESS_KEY_ID'
    );
    const secretAccessKey = this.configService.get<string>(
      'CLOUDFLARE_R2_SECRET_ACCESS_KEY'
    );

    if (!accountId || !bucketName || !accessKeyId || !secretAccessKey) {
      this.logger.error(
        'Storage configuration is missing. Required: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_BUCKET_NAME, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY'
      );
      throw new Error('Storage configuration is missing.');
    }

    return {
      bucketName,
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };
  }
}
