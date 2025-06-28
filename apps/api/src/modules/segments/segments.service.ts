import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Not, IsNull } from 'typeorm';
import { Segment, SegmentType } from '../../entities/segment.entity';
import { CreateSegmentDto } from './dto/segment.dto';
import { SegmentMember } from '../../entities/segment-member.entity';
import { Contact } from '../../entities/contact.entity';
import { ListParamsDto } from '../common/dto/list-params.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SegmentsService {
  private readonly locationId: string;
  constructor(
    @InjectRepository(Segment)
    private segmentsRepository: Repository<Segment>,
    @InjectRepository(SegmentMember)
    private segmentMembersRepository: Repository<SegmentMember>,
    @InjectRepository(Contact)
    private contactsRepository: Repository<Contact>,
    private readonly configService: ConfigService
  ) {
    this.locationId = this.configService.get<string>('LOCATION_ID');
  }

  async create(createSegmentDto: CreateSegmentDto): Promise<Segment> {
    const segment = this.segmentsRepository.create({
      ...createSegmentDto,
      type: SegmentType.STATIC, // For now, only static segments
      locationId: this.locationId,
    });
    return this.segmentsRepository.save(segment);
  }

  async findAll(params: {
    search?: string;
    sort?: string;
  }): Promise<Segment[]> {
    const { search, sort } = params;
    const query = this.segmentsRepository
      .createQueryBuilder('segment')
      .where('segment.locationId = :locationId', {
        locationId: this.locationId,
      })
      .loadRelationCountAndMap(
        'segment.memberCount',
        'segment.members',
        'member'
      );

    if (search) {
      const ftsQuery = search
        .trim()
        .split(' ')
        .filter((term) => term)
        .map((term) => `${term}:*`)
        .join(' & ');

      query.where(`segment.search_vector @@ to_tsquery('english', :ftsQuery)`, {
        ftsQuery,
      });
    }

    if (sort) {
      const [field, direction] = sort.split(':');
      const sortDirection = direction.toUpperCase() as 'ASC' | 'DESC';

      // To sort by memberCount, we refer to the alias
      if (field === 'memberCount') {
        query.orderBy('segment.memberCount', sortDirection);
      } else if (
        Object.keys(this.segmentsRepository.metadata.propertiesMap).includes(
          field
        )
      ) {
        query.orderBy(`segment.${field}`, sortDirection);
      }
    } else {
      query.orderBy('segment.updatedAt', 'DESC');
    }

    return query.getMany();
  }

  async findDeleted(): Promise<Segment[]> {
    return this.segmentsRepository.find({
      where: { deletedAt: Not(IsNull()), locationId: this.locationId },
      withDeleted: true,
      order: { deletedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Segment> {
    return this.segmentsRepository.findOne({
      where: { id, locationId: this.locationId },
    });
  }

  async addContacts(segmentId: string, contactIds: string[]): Promise<void> {
    const members = contactIds.map((contactId) => ({
      segmentId,
      contactId,
      locationId: this.locationId,
    }));

    if (members.length === 0) {
      return;
    }

    // This uses a raw `INSERT ... ON CONFLICT DO NOTHING` for performance.
    // It's the most efficient way to add members in bulk while ignoring duplicates.
    await this.segmentMembersRepository
      .createQueryBuilder()
      .insert()
      .into(SegmentMember)
      .values(members)
      .onConflict(`("contact_id", "segment_id") DO NOTHING`)
      .execute();
  }

  async removeMembers(segmentId: string, contactIds: string[]): Promise<void> {
    if (contactIds.length === 0) {
      return;
    }

    await this.segmentMembersRepository.delete({
      segment: { id: segmentId, locationId: this.locationId },
      contact: { id: In(contactIds) },
    });
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

  async softDelete(id: string): Promise<void> {
    await this.segmentsRepository.softDelete({
      id,
      locationId: this.locationId,
    });
  }

  async restore(id: string): Promise<void> {
    await this.segmentsRepository.restore({ id, locationId: this.locationId });
  }
}
