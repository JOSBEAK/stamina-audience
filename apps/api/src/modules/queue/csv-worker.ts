import { Injectable, Logger } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { Message } from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Contact } from '../../entities/contact.entity';
import { CreateContactDto } from '../contacts/dto/contact.dto';
import * as Papa from 'papaparse';
import { SegmentsService } from '../segments/segments.service';
import { ContactsService } from '../contacts/contacts.service';

interface CsvProcessRequest {
  fileKey: string;
  mapping: Record<string, string>;
  segmentId?: string;
}

@Injectable()
export class CsvWorker {
  private readonly logger = new Logger(CsvWorker.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Contact)
    private readonly contactsRepository: Repository<Contact>,
    private readonly segmentsService: SegmentsService,
    private readonly contactsService: ContactsService
  ) {
    const accountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID');
    this.bucketName = this.configService.get<string>('CLOUDFLARE_BUCKET_NAME');
    if (!accountId || !this.bucketName) {
      this.logger.error('Cloudflare R2 configuration is missing.');
      throw new Error('R2 configuration is missing.');
    }
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.configService.get<string>(
          'CLOUDFLARE_R2_ACCESS_KEY_ID'
        ),
        secretAccessKey: this.configService.get<string>(
          'CLOUDFLARE_R2_SECRET_ACCESS_KEY'
        ),
      },
    });
  }

  @SqsMessageHandler('csv-processing', false)
  async handleMessage(message: Message) {
    const job: CsvProcessRequest = JSON.parse(message.Body);
    this.logger.log(`Processing CSV file from key: ${job.fileKey}`);

    const locationId = this.configService.get<string>('LOCATION_ID');
    if (!locationId) {
      this.logger.error('LOCATION_ID environment variable is not set.');
      throw new Error('Service is not configured with a LOCATION_ID.');
    }

    try {
      const getObjectCmd = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: job.fileKey,
      });
      const response = await this.s3Client.send(getObjectCmd);
      const stream = response.Body as NodeJS.ReadableStream;

      const contactsToCreate: CreateContactDto[] = await new Promise(
        (resolve, reject) => {
          const dtos: CreateContactDto[] = [];
          Papa.parse(stream, {
            header: true,
            skipEmptyLines: true,
            step: (results) => {
              const row = results.data as Record<string, any>;
              const mappedObject: Partial<CreateContactDto> = {};

              for (const header in job.mapping) {
                const dtoKey = job.mapping[header];
                if (row[header]) {
                  mappedObject[dtoKey] = row[header];
                }
              }

              const dto = Object.assign(new CreateContactDto(), mappedObject);
              dto.locationId = locationId;

              // Basic validation
              if (dto.email && dto.name) {
                dtos.push(dto);
              } else {
                this.logger.warn(
                  `Skipping invalid row: ${JSON.stringify(row)}`
                );
              }
            },
            complete: () => resolve(dtos),
            error: (error) => reject(error),
          });
        }
      );

      this.logger.log(`Parsed ${contactsToCreate.length} contacts from CSV.`);

      if (contactsToCreate.length > 0) {
        // This uses a raw `INSERT ... ON CONFLICT DO UPDATE` for performance and to handle duplicates.
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

        // The result of an upsert doesn't return the full entity objects,
        // so we need to fetch the contacts we just processed to get their IDs.
        const emails = contactsToCreate.map((c) => c.email);
        const processedContacts = await this.contactsRepository.findBy({
          email: In(emails),
          locationId: locationId,
        });

        if (job.segmentId && processedContacts.length > 0) {
          this.logger.log(
            `Adding ${processedContacts.length} contacts to segment ${job.segmentId}.`
          );
          await this.segmentsService.addContactsToSegment(job.segmentId, {
            contactIds: processedContacts.map((c) => c.id),
          });
          this.logger.log(`Successfully added contacts to segment.`);
        }
      }

      this.logger.log(`Finished processing CSV file: ${job.fileKey}`);
    } catch (error) {
      this.logger.error(
        `Failed to process CSV file ${job.fileKey}:`,
        error.stack
      );
      // Depending on the error, you might want to re-throw to keep the message in the queue for a retry.
      throw error;
    }
  }
}
