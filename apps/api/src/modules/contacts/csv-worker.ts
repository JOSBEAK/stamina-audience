import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { Message } from '@aws-sdk/client-sqs';
import { Repository, In } from 'typeorm';
import * as Papa from 'papaparse';
import { CsvRowData } from '@stamina-project/types';

import {
  BaseQueueWorker,
  QueueService,
  IQueueWorker,
} from '@stamina-project/queue';
import { StorageService } from '@stamina-project/uploads';

import { Contact } from '../../entities/contact.entity';
import { CreateContactDto } from './dto/contact.dto';
import { AudienceListsService } from '../audience-lists/audience-lists.service';
import { ContactsService } from './contacts.service';
import { CsvProcessRequestDto } from './dto/csv-process-request.dto';

/**
 * Queue worker responsible for processing CSV file uploads
 * Handles parsing CSV files, creating contacts, and adding them to audience lists
 *
 * @class CsvWorker
 * @extends BaseQueueWorker
 * @implements IQueueWorker<CsvProcessRequestDto>
 */
@Injectable()
export class CsvWorker
  extends BaseQueueWorker
  implements IQueueWorker<CsvProcessRequestDto>
{
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Contact)
    private readonly contactsRepository: Repository<Contact>,
    private readonly audienceListsService: AudienceListsService,
    private readonly contactsService: ContactsService,
    private readonly storageService: StorageService,
    private readonly queueService: QueueService
  ) {
    super();
  }

  /**
   * Handle incoming SQS messages for CSV processing
   *
   * @param message - The SQS message containing the CSV processing request
   * @throws {Error} When message validation fails or processing encounters an error
   */
  @SqsMessageHandler('csv-processing', false)
  async handleMessage(message: Message): Promise<void> {
    const messageId = message.MessageId || 'unknown';
    this.logProcessingStart(messageId, 'Processing CSV file');

    try {
      const job = this.parseMessage(message.Body || '');

      if (!this.validateMessage(job)) {
        throw new Error('Invalid message format');
      }

      await this.processCsvFile(job);
      this.logProcessingComplete(messageId, 'Successfully processed CSV file');
    } catch (error) {
      this.handleError(error, 'Failed to process CSV file');
      throw error;
    }
  }

  /**
   * Parse the message body into a typed CSV process request
   *
   * @param messageBody - The raw message body JSON string
   * @returns Parsed CSV process request DTO
   */
  parseMessage(messageBody: string): CsvProcessRequestDto {
    return this.queueService.parseMessageBody<CsvProcessRequestDto>(
      messageBody
    );
  }

  /**
   * Validate the parsed CSV process request
   *
   * @param message - The parsed message to validate
   * @returns True if the message is valid, false otherwise
   */
  validateMessage(message: CsvProcessRequestDto): boolean {
    return (
      this.queueService.validateMessage(message) &&
      typeof message.fileKey === 'string' &&
      typeof message.mapping === 'object' &&
      message.mapping !== null
    );
  }

  /**
   * Process the CSV file from storage
   * Downloads the file, parses it, creates contacts, and optionally adds to audience list
   *
   * @private
   * @param job - The CSV processing job configuration
   * @throws {Error} When LOCATION_ID is not configured or processing fails
   */
  private async processCsvFile(job: CsvProcessRequestDto): Promise<void> {
    const locationId = this.configService.get<string>('LOCATION_ID');
    if (!locationId) {
      this.logger.error('LOCATION_ID environment variable is not set.');
      throw new Error('Service is not configured with a LOCATION_ID.');
    }

    this.logger.log(`[DEBUG] processCsvFile received fileKey: ${job.fileKey}`);
    this.logger.log(`Processing CSV file from key: ${job.fileKey}`);

    // Download file from storage
    const fileData = await this.storageService.downloadFile(job.fileKey);
    const stream = fileData.stream;

    const contactsToCreate = await this.parseCsvStream(
      stream,
      job.mapping,
      locationId
    );
    this.logger.log(`Parsed ${contactsToCreate.length} contacts from CSV.`);

    if (contactsToCreate.length > 0) {
      await this.insertContacts(contactsToCreate, locationId);

      if (job.audienceListId) {
        await this.addContactsToAudienceList(
          job.audienceListId,
          contactsToCreate.map((c) => c.email),
          locationId
        );
      }
    }

    this.logger.log(`Finished processing CSV file: ${job.fileKey}`);
  }

  /**
   * Parse CSV stream and convert rows to contact DTOs
   *
   * @private
   * @param stream - The CSV file stream
   * @param mapping - Field mapping configuration
   * @param locationId - The location ID to assign to contacts
   * @returns Promise resolving to array of contact DTOs
   */
  private async parseCsvStream(
    stream: NodeJS.ReadableStream,
    mapping: Record<string, string>,
    locationId: string
  ): Promise<CreateContactDto[]> {
    return new Promise((resolve, reject) => {
      const dtos: CreateContactDto[] = [];

      Papa.parse(stream, {
        header: true,
        skipEmptyLines: true,
        step: (results) => {
          const row = results.data as CsvRowData;
          const mappedObject: Partial<CreateContactDto> = {};

          // Apply field mapping
          for (const header in mapping) {
            const dtoKey = mapping[header];
            if (row[header]) {
              mappedObject[dtoKey] = row[header];
            }
          }

          const dto = Object.assign(new CreateContactDto(), mappedObject);
          dto.locationId = locationId;

          // Basic validation - email and name are required
          if (dto.email && dto.name) {
            dtos.push(dto);
          } else {
            this.logger.warn(`Skipping invalid row: ${JSON.stringify(row)}`);
          }
        },
        complete: () => resolve(dtos),
        error: (error) => reject(error),
      });
    });
  }

  /**
   * Insert contacts into database using upsert strategy
   * Uses INSERT ... ON CONFLICT DO UPDATE for performance
   *
   * @private
   * @param contactsToCreate - Array of contact DTOs to insert
   * @param locationId - The location ID for filtering
   */
  private async insertContacts(
    contactsToCreate: CreateContactDto[],
    locationId: string
  ): Promise<void> {
    // Build upsert query for performance and duplicate handling
    const columns = Object.keys(contactsToCreate[0]).filter(
      (key) => key !== 'email'
    );
    const onConflict = `("email") DO UPDATE SET ${columns
      .map((col) => `"${col}" = EXCLUDED."${col}"`)
      .join(', ')}`;

    await this.contactsRepository
      .createQueryBuilder()
      .insert()
      .into(Contact)
      .values(contactsToCreate)
      .onConflict(onConflict)
      .execute();

    this.logger.log(
      `Successfully upserted ${contactsToCreate.length} contacts.`
    );
  }

  /**
   * Add processed contacts to an audience list
   *
   * @private
   * @param audienceListId - The ID of the audience list
   * @param emails - Array of contact emails to add
   * @param locationId - The location ID for filtering
   */
  private async addContactsToAudienceList(
    audienceListId: string,
    emails: string[],
    locationId: string
  ): Promise<void> {
    // Fetch the contacts we just processed to get their IDs
    const processedContacts = await this.contactsRepository.findBy({
      email: In(emails),
      locationId: locationId,
    });

    if (processedContacts.length > 0) {
      this.logger.log(
        `Adding ${processedContacts.length} contacts to audience list ${audienceListId}.`
      );

      await this.audienceListsService.addContactsToAudienceList(
        audienceListId,
        {
          contactIds: processedContacts.map((c) => c.id),
        }
      );

      this.logger.log('Successfully added contacts to audience list.');
    }
  }
}
