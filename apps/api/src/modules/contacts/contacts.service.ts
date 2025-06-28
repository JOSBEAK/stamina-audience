import { Injectable, NotFoundException, Logger } from '@nestjs/common';
// import { SqsService } from '@ssut/nestjs-sqs';
// import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../../entities/contact.entity';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';
import { ConfigService } from '@nestjs/config';

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

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);
  private readonly locationId: string;
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>, // private readonly sqsService: SqsService
    private readonly configService: ConfigService
  ) {
    this.locationId = this.configService.get<string>('LOCATION_ID');
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

  createBatch(createContactDtos: CreateContactDto[]): Promise<Contact[]> {
    const contacts = this.contactRepository.create(
      createContactDtos.map((c) => ({ ...c, locationId: this.locationId }))
    );
    return this.contactRepository.save(contacts);
  }

  async findAll(params: FindAllParams): Promise<{
    data: Contact[];
    total: number;
  }> {
    const {
      role,
      company,
      location,
      industry,
      search,
      sort,
      take = 10,
      skip = 0,
    } = params;
    const query = this.contactRepository
      .createQueryBuilder('contact')
      .where('contact.locationId = :locationId', {
        locationId: this.locationId,
      });

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

    if (sort) {
      const [field, order] = sort.split(':');
      query.orderBy(`contact.${field}`, order.toUpperCase() as 'ASC' | 'DESC');
    } else {
      query
        .orderBy('contact.createdAt', 'DESC')
        .addOrderBy('contact.id', 'DESC');
    }

    query.skip(skip).take(take);

    const [data, total] = await query.getManyAndCount();

    return { data, total };
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
    attribute: 'company' | 'location' | 'industry' | 'role',
    search: string
  ): Promise<string[]> {
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
}
