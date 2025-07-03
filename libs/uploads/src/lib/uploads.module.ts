import { Module, DynamicModule, Global } from '@nestjs/common';

import { StorageService } from './services/storage.service';
import { UploadsService } from './services/uploads.service';
import { UploadsController } from './controllers/uploads.controller';
import {
  UploadsConfig,
  UploadsModuleAsyncOptions,
} from './interfaces/uploads-config.interface';

/**
 * Generic uploads module that provides file upload functionality
 * Can be configured for different storage providers (AWS S3, Cloudflare R2, etc.)
 */
@Global()
@Module({})
export class UploadsModule {
  /**
   * Register the uploads module with static configuration
   *
   * @param config - Upload configuration options
   * @returns Configured dynamic module
   */
  static forRoot(config: UploadsConfig): DynamicModule {
    return {
      module: UploadsModule,
      providers: [
        {
          provide: 'UPLOADS_CONFIG',
          useValue: config,
        },
        StorageService,
        UploadsService,
      ],
      controllers: [UploadsController],
      exports: [StorageService, UploadsService],
      global: true,
    };
  }

  /**
   * Register the uploads module with async configuration
   * Useful when configuration depends on environment variables or other services
   *
   * @param options - Async configuration options
   * @returns Configured dynamic module
   */
  static forRootAsync(options: UploadsModuleAsyncOptions): DynamicModule {
    return {
      module: UploadsModule,
      imports: options.imports || [],
      providers: [
        {
          provide: 'UPLOADS_CONFIG',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        StorageService,
        UploadsService,
      ],
      controllers: [UploadsController],
      exports: [StorageService, UploadsService],
      global: true,
    };
  }
}
