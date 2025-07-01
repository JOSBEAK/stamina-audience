# Usage Guide - @stamina-project/uploads

This guide provides detailed examples of how to use the uploads library in different scenarios.

## Configuration Examples

### Environment Variables Setup

```bash
# Cloudflare R2 Configuration
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_BUCKET_NAME=your-bucket-name
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_R2_ASSETS_URL=https://pub-domain.r2.dev

# AWS S3 Configuration  
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_PUBLIC_URL=https://your-bucket.s3.amazonaws.com
```

### Module Registration Examples

#### For Root Applications (with REST API)

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UploadsModule } from '@stamina-project/uploads';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UploadsModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        provider: 'cloudflare-r2',
        region: 'auto',
        bucket: configService.get('CLOUDFLARE_BUCKET_NAME'),
        credentials: {
          accessKeyId: configService.get('CLOUDFLARE_R2_ACCESS_KEY_ID'),
          secretAccessKey: configService.get('CLOUDFLARE_R2_SECRET_ACCESS_KEY'),
        },
        endpoint: `https://${configService.get('CLOUDFLARE_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
        publicUrlBase: configService.get('CLOUDFLARE_R2_ASSETS_URL'),
        defaultExpiresIn: 3600,
        defaultAccessLevel: 'private',
        maxFileSize: 50 * 1024 * 1024, // 50MB
        allowedFileTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'text/csv',
          'application/pdf',
        ],
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

#### For Feature Modules (services only)

```typescript
// feature.module.ts
import { Module } from '@nestjs/common';
import { UploadsModule } from '@stamina-project/uploads';
import { FeatureService } from './feature.service';

@Module({
  imports: [
    UploadsModule.forFeature({
      provider: 'aws-s3',
      region: 'us-east-1',
      bucket: 'my-feature-bucket',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      publicUrlBase: 'https://my-feature-bucket.s3.amazonaws.com',
    }),
  ],
  providers: [FeatureService],
})
export class FeatureModule {}
```

## Service Usage Examples

### Basic File Upload

```typescript
import { Injectable } from '@nestjs/common';
import { UploadsService } from '@stamina-project/uploads';

@Injectable()
export class DocumentService {
  constructor(private readonly uploadsService: UploadsService) {}

  async uploadDocument(fileName: string, fileType: string) {
    const result = await this.uploadsService.createPresignedUrl({
      fileName,
      fileType,
      accessLevel: 'private',
      expiresIn: 1800, // 30 minutes
      metadata: {
        category: 'documents',
        uploadedBy: 'user-id',
      },
    });

    return {
      uploadUrl: result.presignedUrl,
      fileKey: result.fileKey,
      expiresAt: result.expiresAt,
    };
  }
}
```

### CSV Processing with File Download

```typescript
import { Injectable } from '@nestjs/common';
import { UploadsService, StorageService } from '@stamina-project/uploads';

@Injectable()
export class CsvProcessorService {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly storageService: StorageService
  ) {}

  async processUploadedCsv(fileKey: string) {
    // Download the file
    const { stream } = await this.storageService.downloadFile(fileKey);
    
    // Process the CSV stream
    // ... CSV processing logic ...
    
    // Clean up the file after processing
    await this.storageService.deleteFile(fileKey);
  }
}
```

### File Management Operations

```typescript
import { Injectable } from '@nestjs/common';
import { UploadsService } from '@stamina-project/uploads';

@Injectable()
export class FileManagerService {
  constructor(private readonly uploadsService: UploadsService) {}

  async getFileInfo(fileKey: string) {
    const exists = await this.uploadsService.fileExists(fileKey);
    if (!exists) {
      throw new Error('File not found');
    }

    const metadata = await this.uploadsService.getFileMetadata(fileKey);
    return {
      fileKey,
      exists,
      size: metadata.contentLength,
      contentType: metadata.contentType,
      lastModified: metadata.lastModified,
    };
  }

  async generateShareLink(fileKey: string, expiresInHours = 24) {
    const expiresIn = expiresInHours * 3600; // Convert to seconds
    const downloadUrl = await this.uploadsService.generateDownloadUrl(
      fileKey,
      expiresIn
    );
    
    return {
      downloadUrl,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    };
  }

  async deleteFiles(fileKeys: string[]) {
    await this.uploadsService.deleteFiles({ fileKeys });
  }
}
```

## REST API Usage

When using `forRoot()` or `forRootAsync()`, the library provides REST endpoints:

### Generate Presigned URL

```bash
POST /uploads/presigned-url
Content-Type: application/json

{
  "fileName": "report.pdf",
  "fileType": "application/pdf",
  "accessLevel": "private",
  "expiresIn": 3600,
  "metadata": {
    "category": "reports",
    "department": "finance"
  }
}
```

Response:
```json
{
  "presignedUrl": "https://bucket.r2.cloudflarestorage.com/...",
  "publicUrl": "https://pub-domain.r2.dev/uploads/12345-uuid-report.pdf",
  "fileKey": "uploads/12345-uuid-report.pdf",
  "expiresAt": "2024-01-15T12:00:00Z"
}
```

### Check File Existence

```bash
GET /uploads/file/uploads%2F12345-uuid-report.pdf/exists
```

Response:
```json
{
  "exists": true
}
```

### Get File Metadata

```bash
GET /uploads/file/uploads%2F12345-uuid-report.pdf/metadata
```

Response:
```json
{
  "contentType": "application/pdf",
  "contentLength": 1024000,
  "lastModified": "2024-01-15T10:30:00Z",
  "metadata": {
    "category": "reports",
    "department": "finance"
  }
}
```

### Generate Download URL

```bash
GET /uploads/file/uploads%2F12345-uuid-report.pdf/download-url?expiresIn=7200
```

Response:
```json
{
  "downloadUrl": "https://bucket.r2.cloudflarestorage.com/..."
}
```

### Delete File

```bash
DELETE /uploads/file
Content-Type: application/json

{
  "fileKey": "uploads/12345-uuid-report.pdf"
}
```

### Delete Multiple Files

```bash
DELETE /uploads/files
Content-Type: application/json

{
  "fileKeys": [
    "uploads/file1.pdf",
    "uploads/file2.jpg"
  ]
}
```

## Error Handling

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { UploadsService } from '@stamina-project/uploads';

@Injectable()
export class SafeUploadsService {
  private readonly logger = new Logger(SafeUploadsService.name);

  constructor(private readonly uploadsService: UploadsService) {}

  async safeUpload(fileName: string, fileType: string) {
    try {
      return await this.uploadsService.createPresignedUrl({
        fileName,
        fileType,
      });
    } catch (error) {
      this.logger.error(`Upload failed for ${fileName}`, error.stack);
      
      // Handle specific error types
      if (error.message.includes('Invalid file type')) {
        throw new Error('File type not supported');
      }
      
      if (error.message.includes('File size too large')) {
        throw new Error('File exceeds maximum size limit');
      }
      
      throw new Error('Upload service temporarily unavailable');
    }
  }
}
```

## Best Practices

### 1. Use Appropriate Access Levels

```typescript
// For public assets (images, videos)
accessLevel: 'public'

// For user documents
accessLevel: 'private'

// For authenticated user content
accessLevel: 'authenticated'
```

### 2. Set Reasonable Expiration Times

```typescript
// Quick uploads (images)
expiresIn: 300 // 5 minutes

// Document uploads
expiresIn: 1800 // 30 minutes

// Large file uploads
expiresIn: 3600 // 1 hour
```

### 3. Include Metadata for Better Organization

```typescript
metadata: {
  userId: user.id,
  category: 'profile-pictures',
  originalName: file.originalName,
  uploadedAt: new Date().toISOString(),
}
```

### 4. Clean Up Temporary Files

```typescript
// Process file and clean up
async processAndCleanup(fileKey: string) {
  try {
    await this.processFile(fileKey);
  } finally {
    // Always clean up, even if processing fails
    await this.uploadsService.deleteFile({ fileKey });
  }
}
```

This library provides a robust, type-safe solution for file uploads that can be easily integrated into any NestJS application within the monorepo. 