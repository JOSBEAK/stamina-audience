import { Injectable, Logger } from '@nestjs/common';
import { BaseQueueMessage } from '../types/queue.types';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  /**
   * Enrich a message with standard queue metadata
   * @param message The message to enrich
   * @returns The enriched message
   */
  enrichMessage<T extends BaseQueueMessage>(
    message: T
  ): T & {
    id: string;
    timestamp: number;
    retryCount: number;
  } {
    return {
      ...message,
      id: message.id || this.generateMessageId(),
      timestamp: message.timestamp || Date.now(),
      retryCount: message.retryCount || 0,
    };
  }

  /**
   * Validate a queue message
   * @param message The message to validate
   * @returns True if the message is valid
   */
  validateMessage(message: BaseQueueMessage): boolean {
    return typeof message === 'object' && message !== null;
  }

  /**
   * Parse a message body from JSON
   * @param messageBody The raw message body
   * @returns The parsed message
   */
  parseMessageBody<T extends BaseQueueMessage>(messageBody: string): T {
    try {
      return JSON.parse(messageBody) as T;
    } catch (error) {
      this.logger.error('Failed to parse message body:', error);
      throw new Error('Invalid message format');
    }
  }

  /**
   * Generate a unique message ID
   */
  generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log processing events
   * @param event The event type
   * @param messageId The message ID
   * @param context Additional context
   */
  logProcessingEvent(
    event: 'start' | 'complete' | 'error',
    messageId: string,
    context?: string
  ): void {
    const message = context
      ? `Processing ${event} for message ${messageId}: ${context}`
      : `Processing ${event} for message ${messageId}`;

    if (event === 'error') {
      this.logger.error(message);
    } else {
      this.logger.log(message);
    }
  }
}
