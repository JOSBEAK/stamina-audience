import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { SqsService } from '@ssut/nestjs-sqs';
import { Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contact } from '../../entities/contact.entity';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';
import { ContactListParamsDto } from './dto/contact-list-params.dto';
import { PaginatedResponseDto, QueryUtils } from '@stamina-project/common';

// interface FindAllParams {
//   role?: string;
//   company?: string;
//   location?: string;
//   industry?: string;
//   search?: string;
//   sort?: string;
//   take?: number;
//   skip?: number;
// }

interface ProcessCsvJob {
  fileKey: string;
  mapping: Record<string, string>;
  audienceListId?: string;
  // perhaps add userId here in the future
}

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);
  private readonly locationId: string;

  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @Optional() private readonly sqsService: SqsService,
    private readonly configService: ConfigService
  ) {
    this.locationId = this.configService.get<string>('LOCATION_ID');
    if (!this.locationId) {
      throw new Error('LOCATION_ID is not set in the environment variables.');
    }
  }

  create(createContactDto: CreateContactDto): Promise<Contact> {
    const contact = this.contactRepository.create({
      ...createContactDto,
      locationId: this.locationId,
    });
    this.logger.log(`Creating contact for email: ${createContactDto.email}`);
    return this.contactRepository.save(contact);
  }

  async createBatch(createContactDtos: CreateContactDto[]): Promise<Contact[]> {
    const contacts = createContactDtos.map((dto) =>
      this.contactRepository.create({ ...dto, locationId: this.locationId })
    );
    return this.contactRepository.save(contacts);
  }

  async findAll(
    params: ContactListParamsDto
  ): Promise<PaginatedResponseDto<Contact>> {
    const { role, company, location, industry, search } = params;
    const query = this.contactRepository.createQueryBuilder('contact');

    // Apply business-specific filters
    this.applyBusinessFilters(query, { role, company, location, industry });

    // Apply advanced search (full-text search + fallback)
    if (search) {
      this.applyAdvancedSearch(query, search);
    }

    // Apply common pagination features (sorting + pagination)
    QueryUtils.applySorting(query, params, 'contact', [
      'name',
      'email',
      'company',
      'role',
      'location',
      'industry',
      'createdAt',
      'updatedAt',
    ]);

    QueryUtils.applyPagination(query, params);

    // A real app would get brandId from auth and add:
    // query.andWhere('contact.brandId = :brandId', { brandId });

    const [data, total] = await query.getManyAndCount();
    return PaginatedResponseDto.create(data, total, params);
  }

  async findOne(id: string): Promise<Contact> {
    const contact = await this.contactRepository.findOneBy({
      id,
      locationId: this.locationId,
    });
    if (!contact) {
      throw new NotFoundException(`Contact with ID "${id}" not found`);
    }
    return contact;
  }

  async findUniqueLocations(): Promise<string[]> {
    const locations = await this.contactRepository
      .createQueryBuilder('contact')
      .select('DISTINCT(contact.location)', 'location')
      .where("contact.location IS NOT NULL AND contact.location != ''")
      .andWhere('contact.locationId = :locationId', {
        locationId: this.locationId,
      })
      .getRawMany();
    return locations.map((l) => l.location);
  }

  async findUniqueCompanies(): Promise<string[]> {
    const companies = await this.contactRepository
      .createQueryBuilder('contact')
      .select('DISTINCT(contact.company)', 'company')
      .where("contact.company IS NOT NULL AND contact.company != ''")
      .andWhere('contact.locationId = :locationId', {
        locationId: this.locationId,
      })
      .getRawMany();
    return companies.map((c) => c.company);
  }

  async searchAttributes(
    attribute: string,
    search: string,
    limit = 5,
    page = 1
  ): Promise<string[]> {
    if (!['company', 'location', 'industry', 'role'].includes(attribute)) {
      throw new Error('Invalid attribute');
    }

    // Use more efficient prefix matching for indexed fields
    const query = this.contactRepository
      .createQueryBuilder('contact')
      .select(`DISTINCT contact.${attribute}`, 'attribute')
      .where(`contact.${attribute} ILIKE :search`, { search: `${search}%` })
      .andWhere('contact.locationId = :locationId', {
        locationId: this.locationId,
      })
      // Order by length for most relevant results first
      .orderBy(`LENGTH(contact.${attribute})`, 'ASC')
      .addOrderBy(`contact.${attribute}`, 'ASC')
      .limit(limit)
      .offset((page - 1) * limit);

    const results = await query.getRawMany();
    return results.map((r) => r.attribute);
  }

  async update(
    id: string,
    updateContactDto: UpdateContactDto
  ): Promise<Contact> {
    const contact = await this.findOne(id);

    const updatedContact = this.contactRepository.merge(
      contact,
      updateContactDto
    );
    return this.contactRepository.save(updatedContact);
  }

  async remove(id: string): Promise<void> {
    const result = await this.contactRepository.delete({
      id,
      locationId: this.locationId,
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Contact with ID "${id}" not found`);
    }
  }

  async removeBatch(ids: string[]): Promise<void> {
    const result = await this.contactRepository
      .createQueryBuilder()
      .delete()
      .from(Contact)
      .where('id IN (:...ids)', { ids })
      .andWhere('locationId = :locationId', { locationId: this.locationId })
      .execute();

    if (result.affected === 0) {
      throw new NotFoundException(`No contacts found with the provided IDs.`);
    }
    this.logger.log(`Batch deleted ${result.affected} contacts.`);
  }

  async queueCsvProcessingJob(job: ProcessCsvJob): Promise<void> {
    if (!this.sqsService) {
      this.logger.error('SQS service is not available');
      throw new InternalServerErrorException(
        'Could not queue CSV processing job.'
      );
    }

    try {
      this.logger.log(
        `[DEBUG] queueCsvProcessingJob sending fileKey: ${job.fileKey}`
      );
      await this.sqsService.send('csv-processing', {
        id: 'csv-job-' + Date.now(),
        body: job,
        // Fifo queues need a deduplication ID
        // messageDeduplicationId: `job-${job.fileKey}`
      });
      this.logger.log(`Queued CSV processing for file: ${job.fileKey}`);
    } catch (error) {
      this.logger.error('Failed to queue CSV processing job', error);
      throw new InternalServerErrorException(
        'Could not queue CSV processing job.'
      );
    }
  }

  /**
   * Apply business-specific filters for contacts
   *
   * @param query - The TypeORM query builder
   * @param filters - Business-specific filter parameters
   */
  private applyBusinessFilters(
    query: SelectQueryBuilder<Contact>,
    filters: {
      role?: string;
      company?: string;
      location?: string;
      industry?: string;
    }
  ) {
    if (filters.role) {
      query.andWhere('contact.role = :role', { role: filters.role });
    }
    if (filters.company) {
      query.andWhere('contact.company = :company', {
        company: filters.company,
      });
    }
    if (filters.location) {
      query.andWhere('contact.location = :location', {
        location: filters.location,
      });
    }
    if (filters.industry) {
      query.andWhere('contact.industry = :industry', {
        industry: filters.industry,
      });
    }
  }

  /**
   * Apply advanced search with full-text search and fallback
   *
   * @param query - The TypeORM query builder
   * @param search - Search term
   */
  private applyAdvancedSearch(
    query: SelectQueryBuilder<Contact>,
    search: string
  ) {
    const ftsQuery = search
      .trim()
      .split(' ')
      .filter((term) => term)
      .map((term) => `${term}:*`)
      .join(' & ');

    const partialMatchQuery = `%${search}%`;

    // Prioritize exact matches and full-text search results
    query.andWhere(
      `(
        contact.search_vector @@ to_tsquery('english', :ftsQuery)
        OR contact.name ILIKE :partialMatchQuery
        OR contact.email ILIKE :partialMatchQuery
        OR contact.company ILIKE :partialMatchQuery
      )`,
      { ftsQuery, partialMatchQuery }
    );

    // Add ranking for better search result ordering
    query.addSelect(
      `GREATEST(
        CASE WHEN contact.search_vector @@ to_tsquery('english', :ftsQuery) 
             THEN ts_rank(contact.search_vector, to_tsquery('english', :ftsQuery)) * 2
             ELSE 0 
        END,
        CASE WHEN contact.name ILIKE :exactMatch THEN 1.5 ELSE 0 END,
        CASE WHEN contact.email ILIKE :exactMatch THEN 1.3 ELSE 0 END,
        CASE WHEN contact.company ILIKE :exactMatch THEN 1.1 ELSE 0 END
      )`,
      'search_rank'
    );

    // Add exact match parameter for better ranking
    query.setParameter('exactMatch', `${search}`);
  }
}
