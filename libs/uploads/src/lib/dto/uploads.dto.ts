import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

import { SupportedFileType, FileAccessLevel } from '../types/uploads.types';

/**
 * DTO for creating a presigned URL
 * Used for requesting upload URLs for files
 */
export class CreatePresignedUrlDto {
  @ApiProperty({
    description: 'Name of the file to upload',
    example: 'document.pdf',
  })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf',
    enum: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/csv',
      'application/json',
      'application/pdf',
      'text/plain',
    ],
  })
  @IsEnum([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'text/csv',
    'application/json',
    'application/pdf',
    'text/plain',
  ])
  fileType!: SupportedFileType;

  @ApiProperty({
    description: 'File access level',
    example: 'private',
    enum: ['public', 'private', 'authenticated'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['public', 'private', 'authenticated'])
  accessLevel?: FileAccessLevel;

  @ApiProperty({
    description: 'URL expiration time in seconds (1-86400)',
    example: 3600,
    minimum: 1,
    maximum: 86400,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(86400) // 24 hours max
  expiresIn?: number;

  @ApiProperty({
    description: 'Custom metadata for the file',
    example: { category: 'documents', department: 'marketing' },
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, string>;
}

/**
 * DTO for presigned URL response
 */
export class PresignedUrlResponseDto {
  @ApiProperty({
    description: 'Presigned URL for uploading the file',
    example: 'https://bucket.s3.amazonaws.com/file.pdf?...',
  })
  presignedUrl!: string;

  @ApiProperty({
    description: 'Public URL where the file will be accessible after upload',
    example: 'https://cdn.example.com/files/file.pdf',
  })
  publicUrl!: string;

  @ApiProperty({
    description: 'Unique key/path of the file in storage',
    example: 'uploads/uuid-file.pdf',
  })
  fileKey!: string;

  @ApiProperty({
    description: 'Expiration timestamp of the presigned URL',
    example: '2024-01-15T12:00:00Z',
  })
  expiresAt!: string;
}

/**
 * DTO for file deletion request
 */
export class DeleteFileDto {
  @ApiProperty({
    description: 'Key/path of the file to delete',
    example: 'uploads/uuid-file.pdf',
  })
  @IsString()
  @IsNotEmpty()
  fileKey!: string;
}

/**
 * DTO for batch file operations
 */
export class BatchFileOperationDto {
  @ApiProperty({
    description: 'Array of file keys to operate on',
    example: ['uploads/file1.pdf', 'uploads/file2.jpg'],
    type: [String],
  })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  fileKeys!: string[];
}

/**
 * DTO for file metadata update
 */
export class UpdateFileMetadataDto {
  @ApiProperty({
    description: 'Key/path of the file to update',
    example: 'uploads/uuid-file.pdf',
  })
  @IsString()
  @IsNotEmpty()
  fileKey!: string;

  @ApiProperty({
    description: 'New metadata for the file',
    example: { category: 'updated', processed: 'true' },
  })
  metadata!: Record<string, string>;
}
