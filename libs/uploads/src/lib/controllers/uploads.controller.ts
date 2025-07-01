import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  Query,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

import { UploadsService } from '../services/uploads.service';
import {
  CreatePresignedUrlDto,
  PresignedUrlResponseDto,
  DeleteFileDto,
  BatchFileOperationDto,
} from '../dto/uploads.dto';

/**
 * Generic uploads controller that can be used across different apps
 * Provides REST API endpoints for file operations
 */
@ApiTags('Uploads')
@Controller('uploads')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * Create a presigned URL for file upload
   *
   * @param createPresignedUrlDto - Upload request data
   * @returns Presigned URL response
   */
  @Post('presigned-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a presigned URL for file upload' })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL generated successfully',
    type: PresignedUrlResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createPresignedUrl(
    @Body() createPresignedUrlDto: CreatePresignedUrlDto
  ): Promise<PresignedUrlResponseDto> {
    return this.uploadsService.createPresignedUrl(createPresignedUrlDto);
  }

  /**
   * Delete a single file
   *
   * @param deleteFileDto - File deletion data
   */
  @Delete('file')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a file from storage' })
  @ApiResponse({ status: 204, description: 'File deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file key' })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteFile(@Body() deleteFileDto: DeleteFileDto): Promise<void> {
    return this.uploadsService.deleteFile(deleteFileDto);
  }

  /**
   * Delete multiple files
   *
   * @param batchFileOperationDto - Batch deletion data
   */
  @Delete('files')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete multiple files from storage' })
  @ApiResponse({ status: 204, description: 'Files deleted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file keys' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteFiles(
    @Body() batchFileOperationDto: BatchFileOperationDto
  ): Promise<void> {
    return this.uploadsService.deleteFiles(batchFileOperationDto);
  }

  /**
   * Check if a file exists
   *
   * @param fileKey - File key to check
   * @returns File existence status
   */
  @Get('file/:fileKey/exists')
  @ApiOperation({ summary: 'Check if a file exists in storage' })
  @ApiParam({ name: 'fileKey', description: 'Key of the file to check' })
  @ApiResponse({
    status: 200,
    description: 'File existence check completed',
    schema: { type: 'object', properties: { exists: { type: 'boolean' } } },
  })
  @ApiResponse({ status: 400, description: 'Invalid file key' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async fileExists(
    @Param('fileKey') fileKey: string
  ): Promise<{ exists: boolean }> {
    const exists = await this.uploadsService.fileExists(
      decodeURIComponent(fileKey)
    );
    return { exists };
  }

  /**
   * Get file metadata
   *
   * @param fileKey - File key to get metadata for
   * @returns File metadata
   */
  @Get('file/:fileKey/metadata')
  @ApiOperation({ summary: 'Get metadata for a file' })
  @ApiParam({ name: 'fileKey', description: 'Key of the file' })
  @ApiResponse({
    status: 200,
    description: 'File metadata retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getFileMetadata(
    @Param('fileKey') fileKey: string
  ): Promise<Record<string, any>> {
    return this.uploadsService.getFileMetadata(decodeURIComponent(fileKey));
  }

  /**
   * Generate a download URL for a file
   *
   * @param fileKey - File key to generate download URL for
   * @param expiresIn - URL expiration time in seconds (query param)
   * @returns Download URL
   */
  @Get('file/:fileKey/download-url')
  @ApiOperation({ summary: 'Generate a download URL for a file' })
  @ApiParam({ name: 'fileKey', description: 'Key of the file' })
  @ApiResponse({
    status: 200,
    description: 'Download URL generated successfully',
    schema: { type: 'object', properties: { downloadUrl: { type: 'string' } } },
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async generateDownloadUrl(
    @Param('fileKey') fileKey: string,
    @Query('expiresIn') expiresIn?: number
  ): Promise<{ downloadUrl: string }> {
    const downloadUrl = await this.uploadsService.generateDownloadUrl(
      decodeURIComponent(fileKey),
      expiresIn
    );
    return { downloadUrl };
  }

  /**
   * Get public URL for a file
   *
   * @param fileKey - File key to get public URL for
   * @returns Public URL
   */
  @Get('file/:fileKey/public-url')
  @ApiOperation({ summary: 'Get public URL for a file' })
  @ApiParam({ name: 'fileKey', description: 'Key of the file' })
  @ApiResponse({
    status: 200,
    description: 'Public URL retrieved successfully',
    schema: { type: 'object', properties: { publicUrl: { type: 'string' } } },
  })
  async getPublicUrl(
    @Param('fileKey') fileKey: string
  ): Promise<{ publicUrl: string }> {
    const publicUrl = this.uploadsService.generatePublicUrl(
      decodeURIComponent(fileKey)
    );
    return { publicUrl };
  }
}
