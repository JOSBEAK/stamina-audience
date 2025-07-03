import {
  StorageProvider,
  SupportedFileType,
  FileAccessLevel,
} from '../types/uploads.types';
import { ModuleAsyncOptions } from '@stamina-project/common';

/**
 * Core configuration interface for uploads module
 */
export interface UploadsConfig {
  /** Storage provider to use */
  provider: StorageProvider;

  /** Region for the storage service */
  region: string;

  /** Bucket/container name */
  bucket: string;

  /** Access credentials */
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };

  /** Custom endpoint URL (for providers like Cloudflare R2) */
  endpoint?: string;

  /** Public URL base for accessing uploaded files */
  publicUrlBase?: string;

  /** Default file access level */
  defaultAccessLevel?: FileAccessLevel;

  /** Maximum file size in bytes */
  maxFileSize?: number;

  /** Allowed file types */
  allowedFileTypes?: SupportedFileType[];

  /** Default presigned URL expiration time in seconds */
  defaultExpiresIn?: number;
}

/**
 * Cloudflare R2 specific configuration
 */
export interface R2Config extends UploadsConfig {
  provider: 'cloudflare-r2';
  /** Cloudflare account ID */
  accountId: string;
}

/**
 * Options for configuring the uploads module asynchronously
 */
export type UploadsModuleAsyncOptions = ModuleAsyncOptions<UploadsConfig>;
