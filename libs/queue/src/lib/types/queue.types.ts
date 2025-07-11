/**
 * Base interface for all queue messages
 */
export interface BaseQueueMessage {
  id?: string;
  timestamp?: number;
  retryCount?: number;
}

/**
 * Configuration for queue consumers and producers
 */
export interface QueueConfig {
  name: string;
  queueUrl: string;
  region?: string;
  batchSize?: number;
  waitTimeSeconds?: number;
  visibilityTimeoutSeconds?: number;
}

/**
 * Configuration for S3/R2 storage
 */
export interface StorageConfig {
  bucketName: string;
  region: string;
  endpoint: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

/**
 * File processing request interface
 */
export interface FileProcessRequest extends BaseQueueMessage {
  fileKey: string;
  originalFileName?: string;
  contentType?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Queue message processing context
 */
export interface QueueMessageContext {
  correlationId?: string;
  userId?: string;
  operation?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Generic processor function type
 */
export type MessageProcessor<T extends BaseQueueMessage> = (
  message: T,
  context?: QueueMessageContext
) => Promise<void>;

/**
 * Queue worker options
 */
export interface QueueWorkerOptions {
  queueName: string;
  batchSize?: number;
  waitTimeSeconds?: number;
  visibilityTimeoutSeconds?: number;
}

/**
 * File download result
 */
export interface FileDownloadResult {
  stream: NodeJS.ReadableStream;
  metadata?: Record<string, unknown>;
  contentType?: string;
  contentLength?: number;
}
