import { QueueConfig } from '../types/queue.types';
import { ModuleAsyncOptions } from '@stamina-project/common';

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
export type QueueModuleAsyncConfig = ModuleAsyncOptions<QueueModuleConfig>;
