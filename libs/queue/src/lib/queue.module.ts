import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SqsModule } from '@ssut/nestjs-sqs';

import {
  QueueModuleConfig,
  QueueModuleAsyncConfig,
} from './interfaces/queue-config.interface';
import { QueueService } from './services/queue.service';
import { StorageService } from './services/storage.service';

/**
 * Generic queue module for the LeadSend monorepo
 *
 * Provides SQS queue infrastructure with storage capabilities.
 * Can be configured statically, asynchronously, or with defaults via forRoot().
 *
 * @example
 * ```typescript
 * // Simple configuration
 * QueueModule.forRoot()
 *
 * // Custom configuration
 * QueueModule.register({
 *   consumers: [{ name: 'my-queue', queueUrl: 'https://...' }],
 *   producers: [{ name: 'my-queue', queueUrl: 'https://...' }]
 * })
 * ```
 *
 * @module QueueModule
 */
@Module({})
export class QueueModule {
  /**
   * Register the queue module with static configuration
   *
   * @param config - The queue configuration
   * @returns Dynamic module configuration
   */
  static register(config: QueueModuleConfig): DynamicModule {
    return {
      module: QueueModule,
      imports: [
        ConfigModule,
        SqsModule.register({
          consumers: config.consumers.map((consumer) => ({
            name: consumer.name,
            queueUrl: consumer.queueUrl,
            region: consumer.region || config.defaultRegion,
          })),
          producers: config.producers.map((producer) => ({
            name: producer.name,
            queueUrl: producer.queueUrl,
            region: producer.region || config.defaultRegion,
          })),
        }),
      ],
      providers: [QueueService, StorageService],
      exports: [QueueService, StorageService, SqsModule],
    };
  }

  /**
   * Register the queue module with async configuration
   *
   * @param config - The async queue configuration factory
   * @returns Dynamic module configuration
   */
  static registerAsync(config: QueueModuleAsyncConfig): DynamicModule {
    return {
      module: QueueModule,
      imports: [
        ConfigModule,
        SqsModule.registerAsync({
          imports: config.imports,
          useFactory: async (...args: unknown[]) => {
            const queueConfig = await config.useFactory(...args);
            return {
              consumers: queueConfig.consumers.map((consumer) => ({
                name: consumer.name,
                queueUrl: consumer.queueUrl,
                region: consumer.region || queueConfig.defaultRegion,
              })),
              producers: queueConfig.producers.map((producer) => ({
                name: producer.name,
                queueUrl: producer.queueUrl,
                region: producer.region || queueConfig.defaultRegion,
              })),
            };
          },
          inject: config.inject,
        }),
      ],
      providers: [QueueService, StorageService],
      exports: [QueueService, StorageService, SqsModule],
    };
  }

  /**
   * Register the queue module with ConfigService integration
   *
   * This is a convenience method that automatically configures queues
   * based on environment variables. Supports CSV processing queue by default.
   *
   * @returns Dynamic module configuration
   */
  static forRoot(): DynamicModule {
    return this.registerAsync({
      imports: [ConfigModule],
      useFactory: (...args: unknown[]): QueueModuleConfig => {
        const configService = args[0] as ConfigService;
        // Default configuration that can be overridden by environment variables
        const consumers = [];
        const producers = [];

        // Add CSV processing queue if configured
        const csvQueueUrl = configService.get<string>(
          'SQS_CSV_PROCESSING_QUEUE_URL'
        );
        if (csvQueueUrl) {
          consumers.push({
            name: 'csv-processing',
            queueUrl: csvQueueUrl,
          });
          producers.push({
            name: 'csv-processing',
            queueUrl: csvQueueUrl,
          });
        }

        return {
          consumers,
          producers,
          defaultRegion: configService.get<string>('AWS_REGION', 'us-east-1'),
        };
      },
      inject: [ConfigService],
    });
  }
}
