import { Message } from '@aws-sdk/client-sqs';
import { BaseQueueMessage } from '../types/queue.types';

/**
 * Interface that queue workers must implement
 */
export interface IQueueWorker<T extends BaseQueueMessage = BaseQueueMessage> {
  /**
   * Process a single message from the queue
   * @param message The SQS message
   */
  handleMessage(message: Message): Promise<void>;

  /**
   * Parse the message body into a typed object
   * @param messageBody The raw message body
   */
  parseMessage(messageBody: string): T;

  /**
   * Validate the parsed message
   * @param message The parsed message
   */
  validateMessage(message: T): boolean;
}
