/**
 * Supported cloud storage providers
 */
export type StorageProvider = 'cloudflare-r2';

/**
 * Upload file types and their MIME types
 */
export type SupportedFileType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/gif'
  | 'image/webp'
  | 'text/csv'
  | 'application/json'
  | 'application/pdf'
  | 'text/plain';

/**
 * File access control options
 */
export type FileAccessLevel = 'public' | 'private' | 'authenticated';

/**
 * Upload status tracking
 */
export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed';

/**
 * Configuration for presigned URL generation
 */
export interface PresignedUrlOptions {
  /** Expiration time in seconds (default: 3600 - 1 hour) */
  expiresIn?: number;

  /** File access level */
  accessLevel?: FileAccessLevel;

  /** Custom metadata to attach to the file */
  metadata?: Record<string, string>;

  /** Custom content disposition */
  contentDisposition?: string;
}
