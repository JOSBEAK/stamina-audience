import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ContactsModule } from '../modules/contacts/contacts.module';
// import { BroadcastsModule } from '../modules/broadcasts/broadcasts.module';
// import { WebhookModule } from '../modules/webhook/webhook.module';
import { UploadsModule } from '../modules/uploads/uploads.module';
import { AudienceListsModule } from '../modules/audience-lists/audience-lists.module';

import { Contact } from '../entities/contact.entity';
import { AudienceList } from '../entities/audience-list.entity';
import { AudienceListMember } from '../entities/audience-list-member.entity';

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
        entities: [Contact, AudienceList, AudienceListMember],
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
    AudienceListsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
