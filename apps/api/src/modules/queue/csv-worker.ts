import { Injectable, Logger } from '@nestjs/common';
import { SqsMessageHandler } from '@ssut/nestjs-sqs';
import { Message } from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { ContactsService } from '../contacts/contacts.service';
import { CreateContactDto } from '../contacts/dto/contact.dto';
import * as Papa from 'papaparse';
import { SegmentsService } from '../segments/segments.service';

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
    private readonly contactsService: ContactsService,
    private readonly segmentsService: SegmentsService
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
        const newContacts = await this.contactsService.createBatch(
          contactsToCreate
        );
        this.logger.log(`Successfully created ${newContacts.length} contacts.`);

        if (job.segmentId && newContacts.length > 0) {
          this.logger.log(
            `Adding ${newContacts.length} contacts to segment ${job.segmentId}.`
          );
          await this.segmentsService.addContactsToSegment(job.segmentId, {
            contactIds: newContacts.map((c) => c.id),
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
