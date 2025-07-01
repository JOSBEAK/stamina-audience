import { Injectable, Logger } from '@nestjs/common';
import { QueueWorkerOptions } from '../types/queue.types';

/**
 * Decorator to mark a class as a queue worker
 * This provides consistent setup and logging for queue workers
 */
export function QueueWorker(options: QueueWorkerOptions) {
  return function <T extends { new (...args: any[]): object }>(constructor: T) {
    // Add Injectable decorator
    Injectable()(constructor);

    // Add logger to the class
    const logger = new Logger(constructor.name);

    // Store options on the class prototype for access in the instance
    constructor.prototype._queueWorkerOptions = options;
    constructor.prototype._logger = logger;

    return class extends constructor {
      public readonly logger = logger;
      public readonly queueWorkerOptions = options;
    };
  };
}

/**
 * Helper function to get queue worker options from a class instance
 */
export function getQueueWorkerOptions(
  instance: any
): QueueWorkerOptions | undefined {
  return instance._queueWorkerOptions;
}

/**
 * Base abstract class for queue workers
 * Provides common functionality and structure
 */
export abstract class BaseQueueWorker {
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * Handle errors in a consistent way
   * @param error The error that occurred
   * @param context Additional context for the error
   */
  protected handleError(error: any, context?: string): void {
    const errorMessage = context
      ? `${context}: ${error.message || error}`
      : error.message || error;

    this.logger.error(errorMessage, error.stack);
  }

  /**
   * Log processing start
   * @param messageId The ID of the message being processed
   * @param context Additional context
   */
  protected logProcessingStart(messageId: string, context?: string): void {
    const message = context
      ? `Starting processing of message ${messageId}: ${context}`
      : `Starting processing of message ${messageId}`;

    this.logger.log(message);
  }

  /**
   * Log processing completion
   * @param messageId The ID of the message that was processed
   * @param context Additional context
   */
  protected logProcessingComplete(messageId: string, context?: string): void {
    const message = context
      ? `Completed processing of message ${messageId}: ${context}`
      : `Completed processing of message ${messageId}`;

    this.logger.log(message);
  }
}
