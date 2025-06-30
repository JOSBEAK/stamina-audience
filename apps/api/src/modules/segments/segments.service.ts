import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Not, IsNull } from 'typeorm';
import { Segment, SegmentType } from '../../entities/segment.entity';
import { CreateSegmentDto } from './dto/segment.dto';
import { SegmentMember } from '../../entities/segment-member.entity';
import { Contact } from '../../entities/contact.entity';
import { ListParamsDto } from '../common/dto/list-params.dto';
import { ConfigService } from '@nestjs/config';
import { IsUUID } from 'class-validator';

export class AddContactsToSegmentDto {
  @IsUUID('all', { each: true })
  contactIds: string[];
}

@Injectable()
export class SegmentsService {
  private readonly locationId: string;

  constructor(
    @InjectRepository(Segment)
    private readonly segmentsRepository: Repository<Segment>,
    @InjectRepository(SegmentMember)
    private readonly segmentMembersRepository: Repository<SegmentMember>,
    @InjectRepository(Contact)
    private readonly contactsRepository: Repository<Contact>,
    private readonly configService: ConfigService
  ) {
    this.locationId = this.configService.get<string>('LOCATION_ID');
    if (!this.locationId) {
      throw new Error('LOCATION_ID is not set in the environment variables.');
    }
  }

  async create(createSegmentDto: CreateSegmentDto): Promise<Segment> {
    const segment = this.segmentsRepository.create({
      ...createSegmentDto,
      locationId: this.locationId,
      type: SegmentType.STATIC,
    });
    return this.segmentsRepository.save(segment);
  }

  async findAll(params: ListParamsDto) {
    const { page = 1, limit = 10, search, sort, folder } = params;
    const query = this.segmentsRepository
      .createQueryBuilder('segment')
      .where('segment.locationId = :locationId', {
        locationId: this.locationId,
      })
      .andWhere('segment.deletedAt IS NULL');

    if (search) {
      query.andWhere('segment.name ILIKE :search', { search: `%${search}%` });
    }

    if (folder) {
      query.andWhere('segment.folder = :folder', { folder });
    } else {
      query.andWhere('segment.folder IS NULL');
    }

    query.addSelect(
      (subQuery) =>
        subQuery
          .select('COUNT(member.id)', 'memberCount')
          .from(SegmentMember, 'member')
          .where('member.segmentId = segment.id'),
      'memberCount'
    );

    // This assumes a 'Broadcast' entity exists and is linked to segments.
    // As the entity is not available, this is a placeholder for the actual implementation.
    // A real implementation would require the Broadcast entity to be defined.
    query.addSelect('0', 'usedInCount');

    if (sort) {
      const [order, direction] = sort.split(':');
      const sortableFields = [
        'name',
        'type',
        'updatedAt',
        'createdAt',
        'memberCount',
        'creator',
        'folder',
        'usedInCount',
      ];
      if (sortableFields.includes(order)) {
        query.orderBy(
          ['memberCount', 'usedInCount'].includes(order)
            ? `"${order}"`
            : `segment.${order}`,
          direction.toUpperCase() as 'ASC' | 'DESC'
        );
      } else {
        query.orderBy('segment.createdAt', 'DESC');
      }
    } else {
      query.orderBy('segment.createdAt', 'DESC');
    }

    const total = await query.getCount();
    const { entities, raw } = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getRawAndEntities();

    const data = entities.map((segment) => {
      const rawSegment = raw.find((r) => r.segment_id === segment.id);
      return {
        ...segment,
        memberCount: rawSegment ? parseInt(rawSegment.memberCount, 10) : 0,
        usedInCount: rawSegment ? parseInt(rawSegment.usedInCount, 10) : 0,
      };
    });

    return { data, total, page, limit };
  }

  async findOne(id: string) {
    return this.segmentsRepository.findOne({
      where: { id, locationId: this.locationId },
    });
  }

  async addContactsToSegment(
    segmentId: string,
    addContactsDto: AddContactsToSegmentDto
  ) {
    const { contactIds } = addContactsDto;
    const members = contactIds.map((contactId) =>
      this.segmentMembersRepository.create({
        segmentId,
        contactId,
        locationId: this.locationId,
      })
    );
    await this.segmentMembersRepository.save(members, { chunk: 100 });
    return { success: true };
  }

  async removeContactsFromSegment(
    segmentId: string,
    contactIds: string[]
  ): Promise<void> {
    if (contactIds.length === 0) {
      return;
    }

    await this.segmentMembersRepository.delete({
      segment: { id: segmentId, locationId: this.locationId },
      contact: { id: In(contactIds) },
    });
  }

  async findFolders(): Promise<string[]> {
    const folders = await this.segmentsRepository
      .createQueryBuilder('segment')
      .select('DISTINCT segment.folder', 'folder')
      .where('segment.locationId = :locationId', {
        locationId: this.locationId,
      })
      .andWhere('segment.folder IS NOT NULL')
      .getRawMany();
    return folders.map((f) => f.folder);
  }

  async findDeleted(params: ListParamsDto) {
    const { page = 1, limit = 10 } = params;
    const [data, total] = await this.segmentsRepository.findAndCount({
      where: {
        deletedAt: Not(IsNull()),
        locationId: this.locationId,
      },
      withDeleted: true,
      skip: (page - 1) * limit,
      take: limit,
      order: {
        deletedAt: 'DESC',
      },
    });
    return { data, total, page, limit };
  }

  async softDelete(id: string): Promise<void> {
    await this.segmentsRepository.softDelete({
      id,
      locationId: this.locationId,
    });
  }

  async restore(id: string): Promise<void> {
    await this.segmentsRepository.restore({ id, locationId: this.locationId });
  }

  async findSegmentContacts(segmentId: string, params: ListParamsDto) {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt:desc',
      search,
      role,
      company,
      location,
      industry,
    } = params;

    const query = this.contactsRepository
      .createQueryBuilder('contact')
      .innerJoin('contact.segmentMembers', 'segmentMember')
      .where('segmentMember.segmentId = :segmentId', { segmentId })
      .andWhere('contact.locationId = :locationId', {
        locationId: this.locationId,
      });

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

    if (role) {
      query.andWhere('contact.role = :role', { role });
    }
    if (company) {
      query.andWhere('contact.company = :company', { company });
    }
    if (location) {
      query.andWhere('contact.location = :location', { location });
    }
    if (industry) {
      query.andWhere('contact.industry = :industry', { industry });
    }

    if (sort) {
      const [field, direction] = sort.split(':');
      query.orderBy(
        `contact.${field}`,
        direction.toUpperCase() as 'ASC' | 'DESC'
      );
    }

    const [data, total] = await query
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }
}
