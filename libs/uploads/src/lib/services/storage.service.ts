import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  S3Client,
  S3ClientConfig,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { UploadsConfig } from '../interfaces/uploads-config.interface';
import { PresignedUrlOptions } from '../types/uploads.types';

/**
 * Storage service that works with Cloudflare R2 using S3-compatible API
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;

  constructor(
    @Inject('UPLOADS_CONFIG')
    private readonly config: UploadsConfig
  ) {
    this.s3Client = this.createS3Client();
  }

  /**
   * Create and configure S3 client for Cloudflare R2
   *
   * @private
   * @returns Configured S3Client instance
   */
  private createS3Client(): S3Client {
    const clientConfig: S3ClientConfig = {
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.credentials.accessKeyId,
        secretAccessKey: this.config.credentials.secretAccessKey,
      },
    };

    // Cloudflare R2 endpoint configuration
    if (this.config.endpoint) {
      clientConfig.endpoint = this.config.endpoint;
    }

    return new S3Client(clientConfig);
  }

  /**
   * Generate a presigned URL for file upload
   *
   * @param fileKey - Unique key/path for the file
   * @param contentType - MIME type of the file
   * @param options - Additional options for the presigned URL
   * @returns Promise resolving to presigned URL
   */
  async generatePresignedUploadUrl(
    fileKey: string,
    contentType: string,
    options: PresignedUrlOptions = {}
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: fileKey,
        ContentType: contentType,
        Metadata: options.metadata,
        ContentDisposition: options.contentDisposition,
      });

      const expiresIn =
        options.expiresIn || this.config.defaultExpiresIn || 3600;

      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      this.logger.log(`Generated presigned upload URL for key: ${fileKey}`);
      return presignedUrl;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to generate presigned URL for ${fileKey}`,
        err.stack
      );
      throw new Error(`Failed to generate presigned URL: ${err.message}`);
    }
  }

  /**
   * Generate a presigned URL for file download
   *
   * @param fileKey - Key/path of the file to download
   * @param expiresIn - URL expiration time in seconds
   * @returns Promise resolving to presigned download URL
   */
  async generatePresignedDownloadUrl(
    fileKey: string,
    expiresIn = 3600
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: fileKey,
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      this.logger.log(`Generated presigned download URL for key: ${fileKey}`);
      return presignedUrl;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Failed to generate download URL for ${fileKey}`,
        err.stack
      );
      throw new Error(`Failed to generate download URL: ${err.message}`);
    }
  }

  /**
   * Download a file from storage
   *
   * @param fileKey - Key/path of the file to download
   * @returns Promise resolving to file data
   */
  async downloadFile(fileKey: string): Promise<{
    stream: NodeJS.ReadableStream;
    metadata?: Record<string, string>;
  }> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.config.bucket,
        Key: fileKey,
      });

      const response = await this.s3Client.send(command);

      if (!response.Body) {
        throw new Error('No file content received');
      }

      this.logger.log(`Downloaded file with key: ${fileKey}`);

      return {
        stream: response.Body as NodeJS.ReadableStream,
        metadata: response.Metadata,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to download file ${fileKey}`, err.stack);
      throw new Error(`Failed to download file: ${err.message}`);
    }
  }

  /**
   * Delete a file from storage
   *
   * @param fileKey - Key/path of the file to delete
   * @returns Promise resolving when file is deleted
   */
  async deleteFile(fileKey: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucket,
        Key: fileKey,
      });

      await this.s3Client.send(command);
      this.logger.log(`Deleted file with key: ${fileKey}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to delete file ${fileKey}`, err.stack);
      throw new Error(`Failed to delete file: ${err.message}`);
    }
  }

  /**
   * Delete multiple files from storage
   *
   * @param fileKeys - Array of file keys to delete
   * @returns Promise resolving when all files are deleted
   */
  async deleteFiles(fileKeys: string[]): Promise<void> {
    try {
      const deletePromises = fileKeys.map((key) => this.deleteFile(key));
      await Promise.all(deletePromises);

      this.logger.log(`Deleted ${fileKeys.length} files`);
    } catch (error) {
      const err = error as Error;
      this.logger.error('Failed to delete multiple files', err.stack);
      throw new Error(`Failed to delete files: ${err.message}`);
    }
  }

  /**
   * Check if a file exists in storage
   *
   * @param fileKey - Key/path of the file to check
   * @returns Promise resolving to true if file exists, false otherwise
   */
  async fileExists(fileKey: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.config.bucket,
        Key: fileKey,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      const err = error as Error & {
        name?: string;
        $metadata?: { httpStatusCode?: number };
      };
      if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
        return false;
      }

      this.logger.error(
        `Failed to check file existence for ${fileKey}`,
        err.stack
      );
      throw new Error(`Failed to check file existence: ${err.message}`);
    }
  }

  /**
   * Get file metadata
   *
   * @param fileKey - Key/path of the file
   * @returns Promise resolving to file metadata
   */
  async getFileMetadata(fileKey: string): Promise<Record<string, unknown>> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.config.bucket,
        Key: fileKey,
      });

      const response = await this.s3Client.send(command);

      return {
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        lastModified: response.LastModified,
        metadata: response.Metadata || {},
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to get metadata for ${fileKey}`, err.stack);
      throw new Error(`Failed to get file metadata: ${err.message}`);
    }
  }

  /**
   * Generate public URL for a file (if supported by the storage provider)
   *
   * @param fileKey - Key/path of the file
   * @returns Public URL for the file
   */
  generatePublicUrl(fileKey: string): string {
    if (!this.config.publicUrlBase) {
      this.logger.warn('Public URL base not configured');
      return '';
    }

    const cleanBase = this.config.publicUrlBase.replace(/\/+$/, '');
    const cleanKey = fileKey.replace(/^\/+/, '');

    return `${cleanBase}/${cleanKey}`;
  }
}
