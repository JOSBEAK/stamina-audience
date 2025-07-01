import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { StorageService } from './storage.service';
import {
  CreatePresignedUrlDto,
  PresignedUrlResponseDto,
  DeleteFileDto,
  BatchFileOperationDto,
} from '../dto/uploads.dto';

/**
 * High-level uploads service that provides business logic for file operations
 * Built on top of the generic StorageService
 */
@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(private readonly storageService: StorageService) {}

  /**
   * Create a presigned URL for file upload
   * Generates a unique file key and provides upload URL
   *
   * @param createPresignedUrlDto - Upload request details
   * @returns Promise resolving to presigned URL response
   */
  async createPresignedUrl(
    createPresignedUrlDto: CreatePresignedUrlDto
  ): Promise<PresignedUrlResponseDto> {
    try {
      const { fileName, fileType, accessLevel, expiresIn, metadata } =
        createPresignedUrlDto;

      // Generate unique file key
      const fileKey = this.generateUniqueFileKey(fileName);

      // Generate presigned upload URL
      const presignedUrl = await this.storageService.generatePresignedUploadUrl(
        fileKey,
        fileType,
        {
          expiresIn,
          accessLevel,
          metadata,
        }
      );

      // Generate public URL
      const publicUrl = this.storageService.generatePublicUrl(fileKey);

      // Calculate expiration timestamp
      const expirationTime = new Date();
      expirationTime.setSeconds(
        expirationTime.getSeconds() + (expiresIn || 3600)
      );

      const response: PresignedUrlResponseDto = {
        presignedUrl,
        publicUrl,
        fileKey,
        expiresAt: expirationTime.toISOString(),
      };

      this.logger.log(`Created presigned URL for file: ${fileName}`);
      return response;
    } catch (error) {
      this.logger.error(
        `Failed to create presigned URL for ${createPresignedUrlDto.fileName}`,
        (error as Error).stack
      );
      throw error;
    }
  }

  /**
   * Delete a single file
   *
   * @param deleteFileDto - File deletion request
   * @returns Promise resolving when file is deleted
   */
  async deleteFile(deleteFileDto: DeleteFileDto): Promise<void> {
    try {
      await this.storageService.deleteFile(deleteFileDto.fileKey);
      this.logger.log(`Deleted file: ${deleteFileDto.fileKey}`);
    } catch (error) {
      this.logger.error(
        `Failed to delete file ${deleteFileDto.fileKey}`,
        (error as Error).stack
      );
      throw error;
    }
  }

  /**
   * Delete multiple files
   *
   * @param batchFileOperationDto - Batch deletion request
   * @returns Promise resolving when all files are deleted
   */
  async deleteFiles(
    batchFileOperationDto: BatchFileOperationDto
  ): Promise<void> {
    try {
      await this.storageService.deleteFiles(batchFileOperationDto.fileKeys);
      this.logger.log(`Deleted ${batchFileOperationDto.fileKeys.length} files`);
    } catch (error) {
      this.logger.error(
        'Failed to delete multiple files',
        (error as Error).stack
      );
      throw error;
    }
  }

  /**
   * Check if a file exists
   *
   * @param fileKey - Key/path of the file to check
   * @returns Promise resolving to true if file exists
   */
  async fileExists(fileKey: string): Promise<boolean> {
    try {
      return await this.storageService.fileExists(fileKey);
    } catch (error) {
      this.logger.error(
        `Failed to check file existence for ${fileKey}`,
        (error as Error).stack
      );
      throw error;
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
      return await this.storageService.getFileMetadata(fileKey);
    } catch (error) {
      this.logger.error(
        `Failed to get metadata for ${fileKey}`,
        (error as Error).stack
      );
      throw error;
    }
  }

  /**
   * Generate a download URL for a file
   *
   * @param fileKey - Key/path of the file
   * @param expiresIn - URL expiration time in seconds
   * @returns Promise resolving to download URL
   */
  async generateDownloadUrl(
    fileKey: string,
    expiresIn = 3600
  ): Promise<string> {
    try {
      return await this.storageService.generatePresignedDownloadUrl(
        fileKey,
        expiresIn
      );
    } catch (error) {
      this.logger.error(
        `Failed to generate download URL for ${fileKey}`,
        (error as Error).stack
      );
      throw error;
    }
  }

  /**
   * Get public URL for a file
   *
   * @param fileKey - Key/path of the file
   * @returns Public URL for the file
   */
  generatePublicUrl(fileKey: string): string {
    return this.storageService.generatePublicUrl(fileKey);
  }

  /**
   * Generate a unique file key with UUID prefix
   *
   * @private
   * @param fileName - Original file name
   * @returns Unique file key
   */
  private generateUniqueFileKey(fileName: string): string {
    const timestamp = Date.now();
    const uuid = uuidv4();
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

    return `uploads/${timestamp}-${uuid}-${cleanFileName}`;
  }
}
