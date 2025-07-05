import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Not, IsNull } from 'typeorm';
import {
  AudienceList,
  AudienceListType,
} from '../../entities/audience-list.entity';
import {
  CreateAudienceListDto,
  AddContactsToAudienceListDto,
} from './dto/audience-list.dto';
import { AudienceListMember } from '../../entities/audience-list-member.entity';
import { Contact } from '../../entities/contact.entity';
import { AudienceListParamsDto } from './dto/audience-list-params.dto';
import { ContactListParamsDto } from '../contacts/dto/contact-list-params.dto';
import { PaginatedResponseDto } from '@stamina-project/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AudienceListsService {
  private readonly locationId: string;

  constructor(
    @InjectRepository(AudienceList)
    private readonly audienceListsRepository: Repository<AudienceList>,
    @InjectRepository(AudienceListMember)
    private readonly audienceListMembersRepository: Repository<AudienceListMember>,
    @InjectRepository(Contact)
    private readonly contactsRepository: Repository<Contact>,
    private readonly configService: ConfigService
  ) {
    this.locationId = this.configService.get<string>('LOCATION_ID');
    if (!this.locationId) {
      throw new Error('LOCATION_ID is not set in the environment variables.');
    }
  }

  async create(
    createAudienceListDto: CreateAudienceListDto
  ): Promise<AudienceList> {
    const audienceList = this.audienceListsRepository.create({
      ...createAudienceListDto,
      locationId: this.locationId,
      type: AudienceListType.STATIC,
    });
    return this.audienceListsRepository.save(audienceList);
  }

  async findAll(
    params: AudienceListParamsDto
  ): Promise<PaginatedResponseDto<AudienceList>> {
    const { page = 1, limit = 10, search, sort, folder } = params;
    const query = this.audienceListsRepository
      .createQueryBuilder('audienceList')
      .where('audienceList.locationId = :locationId', {
        locationId: this.locationId,
      })
      .andWhere('audienceList.deletedAt IS NULL');

    if (search) {
      query.andWhere('audienceList.name ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (folder) {
      query.andWhere('audienceList.folder = :folder', { folder });
    } else {
      query.andWhere('audienceList.folder IS NULL');
    }

    query.addSelect(
      (subQuery) =>
        subQuery
          .select('COUNT(member.id)', 'memberCount')
          .from(AudienceListMember, 'member')
          .where('member.audienceListId = audienceList.id'),
      'memberCount'
    );

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
            : `audienceList.${order}`,
          direction.toUpperCase() as 'ASC' | 'DESC'
        );
      } else {
        query.orderBy('audienceList.createdAt', 'DESC');
      }
    } else {
      query.orderBy('audienceList.createdAt', 'DESC');
    }

    const total = await query.getCount();
    const { entities, raw } = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getRawAndEntities();

    const data = entities.map((audienceList) => {
      const rawAudienceList = raw.find(
        (r) => r.audienceList_id === audienceList.id
      );
      return {
        ...audienceList,
        memberCount: rawAudienceList
          ? parseInt(rawAudienceList.memberCount, 10)
          : 0,
        usedInCount: rawAudienceList
          ? parseInt(rawAudienceList.usedInCount, 10)
          : 0,
      };
    });

    return PaginatedResponseDto.create(data, total, params);
  }

  async findOne(id: string) {
    return this.audienceListsRepository.findOne({
      where: { id, locationId: this.locationId },
    });
  }

  async addContactsToAudienceList(
    audienceListId: string,
    addContactsDto: AddContactsToAudienceListDto
  ) {
    const { contactIds } = addContactsDto;
    const members = contactIds.map((contactId) =>
      this.audienceListMembersRepository.create({
        audienceListId,
        contactId,
        locationId: this.locationId,
      })
    );
    await this.audienceListMembersRepository.save(members, { chunk: 100 });
    return { success: true };
  }

  async removeContactsFromAudienceList(
    audienceListId: string,
    contactIds: string[]
  ): Promise<void> {
    if (contactIds.length === 0) {
      return;
    }

    await this.audienceListMembersRepository.delete({
      audienceListId,
      locationId: this.locationId,
      contactId: In(contactIds),
    });
  }

  async findFolders(): Promise<string[]> {
    const folders = await this.audienceListsRepository
      .createQueryBuilder('audienceList')
      .select('DISTINCT audienceList.folder', 'folder')
      .where('audienceList.locationId = :locationId', {
        locationId: this.locationId,
      })
      .andWhere('audienceList.folder IS NOT NULL')
      .getRawMany();
    return folders.map((f) => f.folder);
  }

  async findDeleted(
    params: AudienceListParamsDto
  ): Promise<PaginatedResponseDto<AudienceList>> {
    const { page = 1, limit = 10 } = params;
    const [data, total] = await this.audienceListsRepository.findAndCount({
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
    return PaginatedResponseDto.create(data, total, params);
  }

  async softDelete(id: string): Promise<void> {
    await this.audienceListsRepository.softDelete({
      id,
      locationId: this.locationId,
    });
  }

  async restore(id: string): Promise<void> {
    await this.audienceListsRepository.restore({
      id,
      locationId: this.locationId,
    });
  }

  async findAudienceListContacts(
    audienceListId: string,
    params: ContactListParamsDto
  ): Promise<PaginatedResponseDto<Contact>> {
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
      .innerJoin('contact.audienceListMembers', 'audienceListMember')
      .where('audienceListMember.audienceListId = :audienceListId', {
        audienceListId,
      })
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

      //Search Vector for FTS and partial match
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

    //Filters
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

    return PaginatedResponseDto.create(data, total, params);
  }
}
