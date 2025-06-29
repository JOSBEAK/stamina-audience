import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { SqsService } from '@ssut/nestjs-sqs';
import { ConfigService } from '@nestjs/config';
import { Contact } from '../../entities/contact.entity';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';
import { ListParamsDto } from '../common/dto/list-params.dto';

interface FindAllParams {
  role?: string;
  company?: string;
  location?: string;
  industry?: string;
  search?: string;
  sort?: string;
  take?: number;
  skip?: number;
}

interface ProcessCsvJob {
  fileKey: string;
  mapping: Record<string, string>;
  segmentId?: string;
  // perhaps add userId here in the future
}

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);
  private readonly locationId: string;

  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly sqsService: SqsService,
    private readonly configService: ConfigService
  ) {
    this.locationId = this.configService.get<string>('LOCATION_ID');
    if (!this.locationId) {
      throw new Error('LOCATION_ID is not set in the environment variables.');
    }
  }

  async queueCsvProcessing() {
    this.logger.warn('SQS is disabled. CSV processing is not queued.');
    // In a real app, you would get file info here
    /*
    const messageBody = {
      fileName: 'contacts.csv',
      userId: 'user-123',
    };

    await this.sqsService.send('csv-processing', {
      id: uuidv4(),
      body: JSON.stringify(messageBody),
      delaySeconds: 0,
    });
    */

    return { status: 'disabled' };
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

  async findAll(params: ListParamsDto) {
    const {
      page = 1,
      role,
      company,
      location,
      industry,
      search,
      sort,
      limit = 10,
    } = params;
    const query = this.contactRepository.createQueryBuilder('contact');

    if (role) {
      query.andWhere('contact.role = :role', { role });
    }
    if (company) {
      query.andWhere('contact.company = :company', {
        company,
      });
    }
    if (location) {
      query.andWhere('contact.location = :location', {
        location,
      });
    }
    if (industry) {
      query.andWhere('contact.industry = :industry', { industry });
    }

    if (search) {
      const ftsQuery = search
        .trim()
        .split(' ')
        .filter((term) => term)
        .map((term) => `${term}:*`)
        .join(' & ');

      const partialMatchQuery = `%${search}%`;

      query.andWhere(
        `(
          contact.search_vector @@ to_tsquery('english', :ftsQuery)
          OR contact.name ILIKE :partialMatchQuery
          OR contact.email ILIKE :partialMatchQuery
          OR contact.company ILIKE :partialMatchQuery
        )`,
        { ftsQuery, partialMatchQuery }
      );
    }
    // A real app would get brandId from auth and add:
    // query.andWhere('contact.brandId = :brandId', { brandId });

    this.applyFilters(query, { role, company, location, industry });

    if (sort) {
      const [order, direction] = sort.split(':');
      query.orderBy(
        `contact.${order}`,
        direction.toUpperCase() as 'ASC' | 'DESC'
      );
    } else {
      query.orderBy('contact.createdAt', 'DESC');
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
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

  async searchAttributes(attribute: string, search: string): Promise<string[]> {
    if (!['company', 'location', 'industry', 'role'].includes(attribute)) {
      throw new Error('Invalid attribute');
    }

    const query = this.contactRepository
      .createQueryBuilder('contact')
      .select(`DISTINCT contact.${attribute}`, 'attribute')
      .where(`contact.${attribute} ILIKE :search`, { search: `${search}%` })
      .andWhere('contact.locationId = :locationId', {
        locationId: this.locationId,
      })
      .limit(4);

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

  uploadCsv() {
    this.logger.warn('CSV Upload endpoint called. Queueing is disabled.');
    // Placeholder for async job logic
    return { status: 'upload endpoint reached (queue disabled)' };
  }

  async queueCsvProcessingJob(job: ProcessCsvJob): Promise<void> {
    const queueName = 'csv-processing';
    try {
      await this.sqsService.send(queueName, {
        id: 'csv-processing-job', // This is message group ID, can be more dynamic
        body: job,
        delaySeconds: 0,
      });
      this.logger.log(`Successfully queued job for file: ${job.fileKey}`);
    } catch (error) {
      this.logger.error(
        `Failed to queue CSV processing job for file: ${job.fileKey}`,
        error
      );
      throw new InternalServerErrorException(
        'Failed to queue CSV for processing.'
      );
    }
  }

  async findSegmentContacts(segmentId: string, params: ListParamsDto) {
    const {
      page = 1,
      limit = 10,
      sort,
      search,
      role,
      company,
      location,
      industry,
    } = params;

    const query = this.contactRepository
      .createQueryBuilder('contact')
      .innerJoin('contact.segmentMembers', 'segmentMember')
      .where('segmentMember.segmentId = :segmentId', { segmentId });

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('contact.name ILIKE :search', { search: `%${search}%` })
            .orWhere('contact.email ILIKE :search', { search: `%${search}%` })
            .orWhere('contact.company ILIKE :search', {
              search: `%${search}%`,
            });
        })
      );
    }

    this.applyFilters(query, { role, company, location, industry });

    if (sort) {
      const [order, direction] = sort.split(':');
      query.orderBy(
        `contact.${order}`,
        direction.toUpperCase() as 'ASC' | 'DESC'
      );
    } else {
      query.orderBy('contact.createdAt', 'DESC');
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  private applyFilters(
    query: any,
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
}
