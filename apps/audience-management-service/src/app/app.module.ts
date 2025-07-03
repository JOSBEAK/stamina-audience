import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UploadsModule } from '@stamina-project/uploads';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ContactsModule } from '../modules/contacts/contacts.module';
import { AudienceListsModule } from '../modules/audience-lists/audience-lists.module';

import { createDatabaseConfig, createUploadsConfig } from '../config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/audience-management-service/.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createDatabaseConfig,
    }),

    UploadsModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: createUploadsConfig,
      inject: [ConfigService],
    }),

    ContactsModule,
    AudienceListsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
