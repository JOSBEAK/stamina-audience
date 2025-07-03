import { ConfigService } from '@nestjs/config';
import { UploadsConfig } from '@stamina-project/uploads';

/**
 * Uploads configuration factory for Cloudflare R2
 *
 * Provides clean, reusable uploads configuration following established patterns
 */
export const createUploadsConfig = (
  configService: ConfigService
): UploadsConfig => ({
  provider: 'cloudflare-r2',
  region: 'auto',
  bucket: configService.get<string>('CLOUDFLARE_BUCKET_NAME'),
  credentials: {
    accessKeyId: configService.get<string>('CLOUDFLARE_R2_ACCESS_KEY_ID'),
    secretAccessKey: configService.get<string>(
      'CLOUDFLARE_R2_SECRET_ACCESS_KEY'
    ),
  },
  endpoint: `https://${configService.get<string>(
    'CLOUDFLARE_ACCOUNT_ID'
  )}.r2.cloudflarestorage.com`,
  publicUrlBase: configService.get<string>('CLOUDFLARE_R2_ASSETS_URL'),
  defaultExpiresIn: 3600,
  defaultAccessLevel: 'private',
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedFileTypes: [
    'text/csv',
    'application/json',
    'image/jpeg',
    'image/png',
    'application/pdf',
  ],
});
