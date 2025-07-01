# @stamina-project/uploads

A generic, reusable uploads library for the Stamina Project monorepo. Provides file upload functionality with S3-compatible storage providers.

## Features

- Multi-provider support (AWS S3, Cloudflare R2, GCP)
- Secure presigned URLs
- Type-safe TypeScript
- NestJS integration
- REST API endpoints
- Comprehensive error handling

## Installation

```typescript
import { UploadsModule, UploadsService } from '@stamina-project/uploads';
```

## Quick Start

```typescript
// Configure module
UploadsModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    provider: 'cloudflare-r2',
    region: 'auto',
    bucket: configService.get('BUCKET_NAME'),
    credentials: {
      accessKeyId: configService.get('ACCESS_KEY'),
      secretAccessKey: configService.get('SECRET_KEY'),
    },
    endpoint: configService.get('ENDPOINT_URL'),
    publicUrlBase: configService.get('PUBLIC_URL'),
  }),
  inject: [ConfigService],
}),

// Use service
const result = await uploadsService.createPresignedUrl({
  fileName: 'document.pdf',
  fileType: 'application/pdf',
});
```

## Configuration

Supports multiple registration methods:
- `forRoot(config)` - Static configuration
- `forRootAsync(options)` - Dynamic configuration
- `forFeature(config)` - Services only
- `forFeatureAsync(options)` - Dynamic services only

See USAGE.md for detailed examples. 