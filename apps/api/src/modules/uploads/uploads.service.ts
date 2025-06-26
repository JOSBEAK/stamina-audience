import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CreatePresignedUrlDto } from './uploads.controller';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadsService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicUrlBase: string;
  private readonly logger = new Logger(UploadsService.name);

  constructor(private readonly configService: ConfigService) {
    const accountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID');
    this.bucketName = this.configService.get<string>('CLOUDFLARE_BUCKET_NAME');
    this.publicUrlBase = this.configService.get<string>(
      'CLOUDFLARE_R2_ASSETS_URL'
    );

    if (!accountId || !this.bucketName || !this.publicUrlBase) {
      this.logger.error(
        'Cloudflare R2 configuration is missing from environment variables.'
      );
      throw new Error('R2 configuration is missing.');
    }

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.get<string>(
          'CLOUDFLARE_R2_ACCESS_KEY_ID'
        ),
        secretAccessKey: this.configService.get<string>(
          'CLOUDFLARE_R2_SECRET_ACCESS_KEY'
        ),
      },
    });
  }

  async createPresignedUrl({ fileName, fileType }: CreatePresignedUrlDto) {
    try {
      const key = `${uuidv4()}-${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: fileType,
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600, // 1 hour
      });

      const publicUrl = `${this.publicUrlBase}/${key}`;

      return { presignedUrl, publicUrl };
    } catch (error) {
      this.logger.error('Failed to create presigned URL', error.stack);
      throw new InternalServerErrorException('Could not create presigned URL');
    }
  }
}
