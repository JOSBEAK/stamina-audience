import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QueueModule } from '@stamina-project/queue';

import { Contact } from '../../entities/contact.entity';
import { AudienceListsModule } from '../audience-lists/audience-lists.module';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { CsvWorker } from './workers/csv-worker';

/**
 * Contacts module handles contact management functionality
 *
 * Provides:
 * - CRUD operations for contacts
 * - CSV file processing for bulk contact imports
 * - Integration with audience lists
 * - Queue-based processing for large uploads
 *
 * @module ContactsModule
 */
@Module({
  imports: [
    // External modules
    ConfigModule,
    QueueModule.forRoot(),

    // TypeORM entities
    TypeOrmModule.forFeature([Contact]),

    // Internal modules
    AudienceListsModule,
  ],
  controllers: [ContactsController],
  providers: [
    ContactsService,
    // Only register CsvWorker if SQS is configured
    ...(process.env.SQS_CSV_PROCESSING_QUEUE_URL ? [CsvWorker] : []),
  ],
  exports: [ContactsService],
})
export class ContactsModule {}
