# Queue Library Usage Guide

The `@stamina-project/queue` library provides a generic queue infrastructure for the LeadSend monorepo. It abstracts common queue operations and storage functionality, making it easy to implement queue workers across different apps.

## Quick Start

### 1. Import the QueueModule in your app

```typescript
import { Module } from '@nestjs/common';
import { QueueModule } from '@stamina-project/queue';

@Module({
  imports: [
    QueueModule.forRoot(), // Auto-configures from environment variables
    // ... other imports
  ],
})
export class AppModule {}
```

### 2. Create a Queue Worker

```typescript
import { Injectable } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { Message } from '@aws-sdk/client-sqs';
import {
  BaseQueueWorker,
  IQueueWorker,
  BaseQueueMessage,
  StorageService,
  QueueService,
} from '@stamina-project/queue';

interface MyCustomMessage extends BaseQueueMessage {
  action: string;
  data: any;
}

@Injectable()
export class MyQueueWorker extends BaseQueueWorker implements IQueueWorker<MyCustomMessage> {
  constructor(
    private readonly storageService: StorageService,
    private readonly queueService: QueueService
  ) {
    super();
  }

  @SqsMessageHandler('my-queue-name', false)
  async handleMessage(message: Message): Promise<void> {
    const messageId = message.MessageId || 'unknown';
    this.logProcessingStart(messageId, 'Processing custom message');

    try {
      const job = this.parseMessage(message.Body || '');
      
      if (!this.validateMessage(job)) {
        throw new Error('Invalid message format');
      }

      await this.processMessage(job);
      this.logProcessingComplete(messageId, 'Successfully processed message');
    } catch (error) {
      this.handleError(error, 'Failed to process message');
      throw error;
    }
  }

  parseMessage(messageBody: string): MyCustomMessage {
    return this.queueService.parseMessageBody<MyCustomMessage>(messageBody);
  }

  validateMessage(message: MyCustomMessage): boolean {
    return (
      this.queueService.validateMessage(message) &&
      typeof message.action === 'string' &&
      message.data !== undefined
    );
  }

  private async processMessage(job: MyCustomMessage): Promise<void> {
    // Your custom processing logic here
    this.logger.log(`Processing action: ${job.action}`);
    
    // Example: Download a file if fileKey is provided
    if ('fileKey' in job) {
      const fileData = await this.storageService.downloadFile(job.fileKey);
      // Process the file...
    }
  }
}
```

## Configuration Options

### Environment Variables

The library uses these environment variables for configuration:

```bash
# Required for S3/R2 storage
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_BUCKET_NAME=your-bucket-name
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key

# Queue URLs (add as needed)
SQS_CSV_PROCESSING_QUEUE_URL=https://sqs.region.amazonaws.com/account/csv-processing
SQS_EMAIL_PROCESSING_QUEUE_URL=https://sqs.region.amazonaws.com/account/email-processing
# ... add more queue URLs as needed

# AWS region
AWS_REGION=us-east-1
```

### Custom Configuration

For custom queue configurations:

```typescript
import { QueueModule } from '@stamina-project/queue';

@Module({
  imports: [
    QueueModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        consumers: [
          {
            name: 'my-custom-queue',
            queueUrl: configService.get('MY_CUSTOM_QUEUE_URL'),
          },
        ],
        producers: [
          {
            name: 'my-custom-queue', 
            queueUrl: configService.get('MY_CUSTOM_QUEUE_URL'),
          },
        ],
        defaultRegion: 'us-west-2',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class MyModule {}
```

## Available Services

### StorageService

Handles S3/R2 file operations:

```typescript
constructor(private readonly storageService: StorageService) {}

// Download a file
const fileData = await this.storageService.downloadFile('file-key');
const stream = fileData.stream;

// Upload a file
await this.storageService.uploadFile('file-key', buffer, metadata);

// Delete a file
await this.storageService.deleteFile('file-key');
```

### QueueService

Provides queue utilities:

```typescript
constructor(private readonly queueService: QueueService) {}

// Parse message body
const message = this.queueService.parseMessageBody<MyMessage>(body);

// Validate message
const isValid = this.queueService.validateMessage(message);

// Enrich message with metadata
const enriched = this.queueService.enrichMessage(message);

// Generate unique ID
const id = this.queueService.generateMessageId();
```

## Common Patterns

### File Processing Worker

```typescript
interface FileProcessingMessage extends FileProcessRequest {
  processingType: 'csv' | 'json' | 'xml';
  options?: Record<string, any>;
}

@Injectable()
export class FileProcessorWorker extends BaseQueueWorker {
  @SqsMessageHandler('file-processing', false)
  async handleMessage(message: Message): Promise<void> {
    const job = this.parseMessage(message.Body);
    const fileData = await this.storageService.downloadFile(job.fileKey);
    
    switch (job.processingType) {
      case 'csv':
        await this.processCsv(fileData.stream, job.options);
        break;
      case 'json':
        await this.processJson(fileData.stream, job.options);
        break;
      // ... more cases
    }
  }
}
```

### Email Processing Worker

```typescript
interface EmailMessage extends BaseQueueMessage {
  recipientEmail: string;
  templateId: string;
  variables: Record<string, any>;
}

@Injectable()
export class EmailWorker extends BaseQueueWorker {
  @SqsMessageHandler('email-processing', false)
  async handleMessage(message: Message): Promise<void> {
    const job = this.parseMessage(message.Body);
    
    // Send email using your email service
    await this.emailService.sendTemplatedEmail({
      to: job.recipientEmail,
      templateId: job.templateId,
      variables: job.variables,
    });
  }
}
```

## Benefits

✅ **Consistent Error Handling**: Built-in error logging and handling  
✅ **Type Safety**: TypeScript interfaces for all message types  
✅ **Reusable Storage Operations**: Common S3/R2 operations  
✅ **Standardized Logging**: Consistent logging across all workers  
✅ **Easy Configuration**: Environment-based or custom configuration  
✅ **Extensible**: Easy to add new queue types and workers  

## Example Apps

- **API App**: Uses for CSV processing (`CsvWorker`)
- **Email Service**: Could use for email queue processing
- **Image Processing**: Could use for image transformation queues
- **Data Pipeline**: Could use for ETL job queues

The generic queue library makes it easy to add new queue-based functionality while maintaining consistency across the monorepo. 