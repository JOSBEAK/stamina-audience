import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QueueModule } from '@stamina-project/queue';

import { Contact } from '../../entities/contact.entity';
import { AudienceListsModule } from '../audience-lists/audience-lists.module';
import { ContactsModule } from '../contacts/contacts.module';
import { CsvWorker } from './csv-worker';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

/**
 * Uploads module handles file upload functionality and CSV processing
 *
 * Provides:
 * - File upload endpoints
 * - CSV processing queue worker
 * - Integration with contact management and audience lists
 *
 * @module UploadsModule
 */
@Module({
  imports: [
    // Configuration
    ConfigModule,

    // External libraries
    QueueModule.forRoot(),
    TypeOrmModule.forFeature([Contact]),

    // Internal modules
    forwardRef(() => ContactsModule),
    AudienceListsModule,
  ],
  controllers: [UploadsController],
  providers: [UploadsService, CsvWorker],
  exports: [UploadsService, QueueModule],
})
export class UploadsModule {}
