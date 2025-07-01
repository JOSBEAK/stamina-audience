import { QueueConfig } from '../types/queue.types';

/**
 * Configuration for the queue module
 */
export interface QueueModuleConfig {
  consumers: QueueConfig[];
  producers: QueueConfig[];
  defaultRegion?: string;
}

/**
 * Async configuration factory function
 */
export interface QueueModuleAsyncConfig {
  imports?: any[];
  useFactory: (
    ...args: any[]
  ) => Promise<QueueModuleConfig> | QueueModuleConfig;
  inject?: any[];
}
