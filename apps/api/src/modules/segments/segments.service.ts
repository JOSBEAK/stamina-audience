import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Segment, SegmentType } from '../../entities/segment.entity';
import { CreateSegmentDto } from './dto/segment.dto';
import { SegmentMember } from '../../entities/segment-member.entity';
import { Contact } from '../../entities/contact.entity';
import { ListParamsDto } from '../common/dto/list-params.dto';

@Injectable()
export class SegmentsService {
  constructor(
    @InjectRepository(Segment)
    private segmentsRepository: Repository<Segment>,
    @InjectRepository(SegmentMember)
    private segmentMembersRepository: Repository<SegmentMember>,
    @InjectRepository(Contact)
    private contactsRepository: Repository<Contact>
  ) {}

  async create(createSegmentDto: CreateSegmentDto): Promise<Segment> {
    const segment = this.segmentsRepository.create({
      ...createSegmentDto,
      type: SegmentType.STATIC, // For now, only static segments
    });
    return this.segmentsRepository.save(segment);
  }

  async findAll(): Promise<Segment[]> {
    return this.segmentsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Segment> {
    return this.segmentsRepository.findOne({ where: { id } });
  }

  async addContacts(segmentId: string, contactIds: string[]): Promise<void> {
    const members = contactIds.map((contactId) => ({
      segmentId,
      contactId,
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
      segment: { id: segmentId },
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
      .where('segmentMember.segmentId = :segmentId', { segmentId });

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
