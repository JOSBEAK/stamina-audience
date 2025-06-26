import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { CsvWorker } from './csv-worker';
import { BroadcastWorker } from './broadcast-worker';

@Module({
  imports: [
    SqsModule.register({
      consumers: [
        {
          name: 'csv-processing',
          queueUrl: process.env.SQS_CSV_QUEUE_URL,
        },
        {
          name: 'broadcast-sending',
          queueUrl: process.env.SQS_BROADCAST_QUEUE_URL,
        },
      ],
      producers: [],
    }),
  ],
  providers: [CsvWorker, BroadcastWorker],
})
export class QueueModule {}
