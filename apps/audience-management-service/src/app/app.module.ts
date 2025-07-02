import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UploadsModule } from '@stamina-project/uploads';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ContactsModule } from '../modules/contacts/contacts.module';
// import { BroadcastsModule } from '../modules/broadcasts/broadcasts.module';
// import { WebhookModule } from '../modules/webhook/webhook.module';
import { AudienceListsModule } from '../modules/audience-lists/audience-lists.module';

import { Contact } from '../entities/contact.entity';
import { AudienceList } from '../entities/audience-list.entity';
import { AudienceListMember } from '../entities/audience-list-member.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/audience-management-service/.env',
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
    // Generic uploads library with Cloudflare R2 configuration
    UploadsModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        provider: 'cloudflare-r2',
        region: 'auto',
        bucket: configService.get<string>('CLOUDFLARE_BUCKET_NAME'),
        credentials: {
          accessKeyId: configService.get<string>('CLOUDFLARE_R2_ACCESS_KEY_ID'),
          secretAccessKey: configService.get<string>(
            'CLOUDFLARE_R2_SECRET_ACCESS_KEY'
          ),
        },
        endpoint: `https://${configService.get<string>(
          'CLOUDFLARE_ACCOUNT_ID'
        )}.r2.cloudflarestorage.com`,
        publicUrlBase: configService.get<string>('CLOUDFLARE_R2_ASSETS_URL'),
        defaultExpiresIn: 3600,
        defaultAccessLevel: 'private',
        maxFileSize: 50 * 1024 * 1024, // 50MB
        allowedFileTypes: [
          'text/csv',
          'application/json',
          'image/jpeg',
          'image/png',
          'application/pdf',
        ],
      }),
      inject: [ConfigService],
    }),

    ContactsModule,
    AudienceListsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
