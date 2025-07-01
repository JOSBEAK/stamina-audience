import { ModuleMetadata } from '@nestjs/common';
import {
  StorageProvider,
  SupportedFileType,
  FileAccessLevel,
} from '../types/uploads.types';

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
 * AWS S3 specific configuration
 */
export interface S3Config extends UploadsConfig {
  provider: 'aws-s3';
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
 * Google Cloud Storage specific configuration
 */
export interface GCPConfig extends UploadsConfig {
  provider: 'gcp-storage';
  /** GCP project ID */
  projectId: string;
}

/**
 * Options for configuring the uploads module asynchronously
 */
export interface UploadsModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => Promise<UploadsConfig> | UploadsConfig;
  inject?: any[];
}
