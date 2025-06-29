import { forwardRef, Module } from '@nestjs/common';
import { CsvWorker } from './csv-worker';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SqsModule } from '@ssut/nestjs-sqs';
import { ContactsModule } from '../contacts/contacts.module';
import { SegmentsModule } from '../segments/segments.module';

@Module({
  imports: [
    ConfigModule,
    SqsModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        consumers: [
          {
            name: 'csv-processing',
            queueUrl: configService.get<string>('SQS_CSV_PROCESSING_QUEUE_URL'),
          },
        ],
        producers: [
          {
            name: 'csv-processing',
            queueUrl: configService.get<string>('SQS_CSV_PROCESSING_QUEUE_URL'),
            region: configService.get<string>('AWS_REGION'),
          },
        ],
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => ContactsModule),
    SegmentsModule,
  ],
  controllers: [],
  providers: [CsvWorker],
  exports: [SqsModule],
})
export class QueueModule {}
