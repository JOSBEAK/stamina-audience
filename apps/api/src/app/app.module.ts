import { Module } from '@nestjs/common';
import { SqsModule } from '@ssut/nestjs-sqs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ContactsModule } from '../modules/contacts/contacts.module';
// import { BroadcastsModule } from '../modules/broadcasts/broadcasts.module';
// import { WebhookModule } from '../modules/webhook/webhook.module';
import { UploadsModule } from '../modules/uploads/uploads.module';
// import { QueueModule } from '../modules/queue/queue.module'; // Temporarily disabled
import { SegmentsModule } from '../modules/segments/segments.module';
// import { QueueModule } from '../modules/queue/queue.module'; // Temporarily disabled

import { Contact } from '../entities/contact.entity';
import { Segment } from '../entities/segment.entity';
import { SegmentMember } from '../entities/segment-member.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/api/.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('TYPEORM_URL'),
        entities: [Contact, Segment, SegmentMember],
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        synchronize: false, // Note: disable in production
      }),
    }),
    /* SQS Module is temporarily disabled
    SqsModule.register({
      consumers: [],
      producers: [
        {
          name: 'csv-processing',
          queueUrl: process.env.SQS_CSV_QUEUE_URL,
          region: process.env.AWS_REGION,
        },
        {
          name: 'broadcast-sending',
          queueUrl: process.env.SQS_BROADCAST_QUEUE_URL,
          region: process.env.AWS_REGION,
        },
      ],
    }),
    */
    ContactsModule,
    UploadsModule,
    // QueueModule, // Temporarily disabled
    SegmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
