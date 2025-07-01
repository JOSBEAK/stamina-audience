// Core module
export { QueueModule } from './lib/queue.module';

// Services
export { QueueService } from './lib/services/queue.service';
export { StorageService } from './lib/services/storage.service';

// Interfaces
export { IQueueWorker } from './lib/interfaces/queue-worker.interface';
export {
  QueueModuleConfig,
  QueueModuleAsyncConfig,
} from './lib/interfaces/queue-config.interface';

// Types
export {
  BaseQueueMessage,
  QueueConfig,
  StorageConfig,
  FileProcessRequest,
  MessageProcessor,
  QueueWorkerOptions,
  FileDownloadResult,
} from './lib/types/queue.types';

// Decorators and base classes
export {
  QueueWorker,
  getQueueWorkerOptions,
  BaseQueueWorker,
} from './lib/decorators/queue-worker.decorator';
