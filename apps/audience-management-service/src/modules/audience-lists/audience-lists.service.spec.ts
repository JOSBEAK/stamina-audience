import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AudienceListsService } from './audience-lists.service';
import {
  AudienceList,
  AudienceListType,
} from '../../entities/audience-list.entity';
import { AudienceListMember } from '../../entities/audience-list-member.entity';
import { Contact } from '../../entities/contact.entity';
import {
  CreateAudienceListDto,
  AddContactsToAudienceListDto,
} from './dto/audience-list.dto';
import { AudienceListParamsDto } from './dto/audience-list-params.dto';
import { ContactListParamsDto } from '../contacts/dto/contact-list-params.dto';

describe('AudienceListsService', () => {
  let service: AudienceListsService;
  let audienceListRepository: Repository<AudienceList>;
  let audienceListMemberRepository: Repository<AudienceListMember>;
  let contactRepository: Repository<Contact>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getCount: jest.fn(),
    getRawAndEntities: jest.fn(),
    getManyAndCount: jest.fn(),
    getRawMany: jest.fn(),
    select: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };

  const mockAudienceListRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockAudienceListMemberRepository = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockContactRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  // Set up the mock before any service instantiation
  mockConfigService.get.mockImplementation((key: string) => {
    if (key === 'LOCATION_ID') return 'test-location-id';
    return undefined;
  });

  const mockAudienceList: AudienceList = {
    id: 'test-uuid',
    locationId: 'test-location-id',
    name: 'Test Audience List',
    type: AudienceListType.STATIC,
    folder: 'test-folder',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    members: [],
    searchVector: '',
    rulesJson: null,
    createdBy: null,
    usedInCount: 0,
  } as AudienceList;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AudienceListsService,
        {
          provide: getRepositoryToken(AudienceList),
          useValue: mockAudienceListRepository,
        },
        {
          provide: getRepositoryToken(AudienceListMember),
          useValue: mockAudienceListMemberRepository,
        },
        {
          provide: getRepositoryToken(Contact),
          useValue: mockContactRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AudienceListsService>(AudienceListsService);
    audienceListRepository = module.get<Repository<AudienceList>>(
      getRepositoryToken(AudienceList)
    );
    audienceListMemberRepository = module.get<Repository<AudienceListMember>>(
      getRepositoryToken(AudienceListMember)
    );
    contactRepository = module.get<Repository<Contact>>(
      getRepositoryToken(Contact)
    );

    mockConfigService.get.mockReturnValue('test-location-id');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error if LOCATION_ID is not set', async () => {
    const tempConfigService = {
      get: jest.fn().mockReturnValue(undefined),
    };

    expect(() => {
      new AudienceListsService(
        audienceListRepository,
        audienceListMemberRepository,
        contactRepository,
        tempConfigService as unknown as ConfigService
      );
    }).toThrow('LOCATION_ID is not set in the environment variables.');
  });

  describe('create', () => {
    const createAudienceListDto: CreateAudienceListDto = {
      name: 'Test Audience List',
      type: AudienceListType.STATIC,
    };

    it('should create an audience list successfully', async () => {
      mockAudienceListRepository.create.mockReturnValue(mockAudienceList);
      mockAudienceListRepository.save.mockResolvedValue(mockAudienceList);

      const result = await service.create(createAudienceListDto);

      expect(result).toEqual(mockAudienceList);
      expect(mockAudienceListRepository.create).toHaveBeenCalledWith({
        ...createAudienceListDto,
        locationId: 'test-location-id',
      });
      expect(mockAudienceListRepository.save).toHaveBeenCalledWith(
        mockAudienceList
      );
    });
  });

  describe('findAll', () => {
    const params = new AudienceListParamsDto();
    Object.assign(params, {
      page: 1,
      limit: 10,
      search: 'test',
      folder: 'test-folder',
    });

    it('should return paginated audience lists', async () => {
      const entities = [mockAudienceList];
      const raw = [
        { audienceList_id: 'test-uuid', memberCount: '5', usedInCount: '2' },
      ];

      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities, raw });

      const result = await service.findAll(params);

      expect(result).toEqual({
        data: [
          {
            ...mockAudienceList,
            memberCount: 5,
            usedInCount: 2,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
      expect(result.data).toHaveLength(1);
      expect(
        mockAudienceListRepository.createQueryBuilder
      ).toHaveBeenCalledWith('audienceList');
    });

    it('should handle search parameter', async () => {
      const entities = [];
      const raw = [];

      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities, raw });

      await service.findAll(params);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'audienceList.name ILIKE :search',
        { search: '%test%' }
      );
    });

    it('should handle folder parameter', async () => {
      const entities = [];
      const raw = [];

      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities, raw });

      await service.findAll(params);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'audienceList.folder = :folder',
        { folder: 'test-folder' }
      );
    });

    it('should handle sorting', async () => {
      const sortParams = new AudienceListParamsDto();
      Object.assign(sortParams, { ...params, sort: 'name:asc' });
      const entities = [];
      const raw = [];

      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities, raw });

      await service.findAll(sortParams);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'audienceList.name',
        'ASC'
      );
    });

    it('should work without search parameter', async () => {
      const noSearchParams = new AudienceListParamsDto();
      Object.assign(noSearchParams, {
        page: 1,
        limit: 10,
        folder: 'test-folder',
      });

      const entities = [];
      const raw = [];

      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities, raw });

      await service.findAll(noSearchParams);

      // Verify search filter is not applied
      const calls = mockQueryBuilder.andWhere.mock.calls;
      const searchCall = calls.find(
        (call) => call[0] && call[0].includes('ILIKE :search')
      );
      expect(searchCall).toBeUndefined();
    });

    it('should handle null folder parameter (else branch)', async () => {
      const nullFolderParams = new AudienceListParamsDto();
      Object.assign(nullFolderParams, {
        page: 1,
        limit: 10,
        folder: null,
      });

      const entities = [];
      const raw = [];

      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities, raw });

      await service.findAll(nullFolderParams);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'audienceList.folder IS NULL'
      );
    });

    it('should handle undefined folder parameter (else branch)', async () => {
      const undefinedFolderParams = new AudienceListParamsDto();
      Object.assign(undefinedFolderParams, {
        page: 1,
        limit: 10,
        // folder is undefined
      });

      const entities = [];
      const raw = [];

      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities, raw });

      await service.findAll(undefinedFolderParams);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'audienceList.folder IS NULL'
      );
    });

    it('should use default sorting when no sort parameter provided', async () => {
      const noSortParams = new AudienceListParamsDto();
      Object.assign(noSortParams, {
        page: 1,
        limit: 10,
      });

      const entities = [];
      const raw = [];

      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities, raw });

      await service.findAll(noSortParams);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'audienceList.createdAt',
        'DESC'
      );
    });

    it('should use default sorting when invalid sort field provided', async () => {
      const invalidSortParams = new AudienceListParamsDto();
      Object.assign(invalidSortParams, {
        page: 1,
        limit: 10,
        sort: 'invalidField:asc',
      });

      const entities = [];
      const raw = [];

      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities, raw });

      await service.findAll(invalidSortParams);

      // Should fall back to default sorting
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'audienceList.createdAt',
        'DESC'
      );
    });

    it('should handle special sort fields (memberCount, usedInCount)', async () => {
      const specialSortParams = new AudienceListParamsDto();
      Object.assign(specialSortParams, {
        page: 1,
        limit: 10,
        sort: 'memberCount:desc',
      });

      const entities = [];
      const raw = [];

      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities, raw });

      await service.findAll(specialSortParams);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        '"memberCount"',
        'DESC'
      );
    });

    it('should handle null rawAudienceList in data mapping', async () => {
      const entities = [mockAudienceList];
      const raw = []; // Empty raw data

      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities, raw });

      const result = await service.findAll(params);

      expect(result.data[0]).toEqual({
        ...mockAudienceList,
        memberCount: 0, // Should default to 0
        usedInCount: 0, // Should default to 0
      });
    });

    it('should handle mismatched raw and entities data', async () => {
      const entities = [mockAudienceList];
      const raw = [
        {
          audienceList_id: 'different-uuid',
          memberCount: '5',
          usedInCount: '2',
        },
      ];

      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities, raw });

      const result = await service.findAll(params);

      expect(result.data[0]).toEqual({
        ...mockAudienceList,
        memberCount: 0, // Should default to 0 when no matching raw data
        usedInCount: 0, // Should default to 0 when no matching raw data
      });
    });
  });

  describe('findOne', () => {
    const audienceListId = 'test-uuid';

    it('should return an audience list by id', async () => {
      mockAudienceListRepository.findOne.mockResolvedValue(mockAudienceList);

      const result = await service.findOne(audienceListId);

      expect(result).toEqual(mockAudienceList);
      expect(mockAudienceListRepository.findOne).toHaveBeenCalledWith({
        where: { id: audienceListId, locationId: 'test-location-id' },
      });
    });

    it('should return null when audience list not found', async () => {
      mockAudienceListRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(audienceListId);

      expect(result).toBeNull();
    });
  });

  describe('addContactsToAudienceList', () => {
    const audienceListId = 'test-uuid';
    const addContactsDto: AddContactsToAudienceListDto = {
      contactIds: ['contact1', 'contact2'],
    };

    it('should add contacts to audience list successfully', async () => {
      const mockMembers = [
        {
          audienceListId,
          contactId: 'contact1',
          locationId: 'test-location-id',
        },
        {
          audienceListId,
          contactId: 'contact2',
          locationId: 'test-location-id',
        },
      ];

      mockAudienceListMemberRepository.create.mockImplementation(
        (data) => data
      );
      mockAudienceListMemberRepository.save.mockResolvedValue(mockMembers);

      const result = await service.addContactsToAudienceList(
        audienceListId,
        addContactsDto
      );

      expect(result).toEqual({ success: true });
      expect(mockAudienceListMemberRepository.create).toHaveBeenCalledTimes(2);
      expect(mockAudienceListMemberRepository.save).toHaveBeenCalledWith(
        mockMembers,
        { chunk: 100 }
      );
    });
  });

  describe('removeContactsFromAudienceList', () => {
    const audienceListId = 'test-uuid';
    const contactIds = ['contact1', 'contact2'];

    it('should remove contacts from audience list successfully', async () => {
      mockAudienceListMemberRepository.delete.mockResolvedValue({
        affected: 2,
      });

      await service.removeContactsFromAudienceList(audienceListId, contactIds);

      expect(mockAudienceListMemberRepository.delete).toHaveBeenCalledWith({
        audienceListId,
        locationId: 'test-location-id',
        contactId: expect.any(Object), // In() function
      });
    });

    it('should handle empty contact ids array', async () => {
      await service.removeContactsFromAudienceList(audienceListId, []);

      expect(mockAudienceListMemberRepository.delete).not.toHaveBeenCalled();
    });

    it('should return early when contactIds array is empty', async () => {
      const deleteSpy = jest.spyOn(mockAudienceListMemberRepository, 'delete');

      const result = await service.removeContactsFromAudienceList(
        audienceListId,
        []
      );

      expect(result).toBeUndefined();
      expect(deleteSpy).not.toHaveBeenCalled();
    });
  });

  describe('findFolders', () => {
    it('should return unique folders', async () => {
      const folders = [{ folder: 'folder1' }, { folder: 'folder2' }];
      mockQueryBuilder.getRawMany.mockResolvedValue(folders);

      const result = await service.findFolders();

      expect(result).toEqual(['folder1', 'folder2']);
      expect(
        mockAudienceListRepository.createQueryBuilder
      ).toHaveBeenCalledWith('audienceList');
    });
  });

  describe('findDeleted', () => {
    const params = new AudienceListParamsDto();
    Object.assign(params, {
      page: 1,
      limit: 10,
    });

    it('should return paginated deleted audience lists', async () => {
      const deletedLists = [{ ...mockAudienceList, deletedAt: new Date() }];
      mockAudienceListRepository.findAndCount.mockResolvedValue([
        deletedLists,
        1,
      ]);

      const result = await service.findDeleted(params);

      expect(result).toEqual({
        data: deletedLists,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
      expect(result.data).toEqual(deletedLists);
      expect(mockAudienceListRepository.findAndCount).toHaveBeenCalledWith({
        where: {
          deletedAt: expect.any(Object), // Not(IsNull())
          locationId: 'test-location-id',
        },
        withDeleted: true,
        skip: 0,
        take: 10,
        order: {
          deletedAt: 'DESC',
        },
      });
    });
  });

  describe('softDelete', () => {
    const audienceListId = 'test-uuid';

    it('should soft delete an audience list', async () => {
      mockAudienceListRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.softDelete(audienceListId);

      expect(mockAudienceListRepository.softDelete).toHaveBeenCalledWith({
        id: audienceListId,
        locationId: 'test-location-id',
      });
    });
  });

  describe('restore', () => {
    const audienceListId = 'test-uuid';

    it('should restore a deleted audience list', async () => {
      mockAudienceListRepository.restore.mockResolvedValue({ affected: 1 });

      await service.restore(audienceListId);

      expect(mockAudienceListRepository.restore).toHaveBeenCalledWith({
        id: audienceListId,
        locationId: 'test-location-id',
      });
    });
  });

  describe('findAudienceListContacts', () => {
    const audienceListId = 'test-uuid';
    const params = new ContactListParamsDto();
    Object.assign(params, {
      page: 1,
      limit: 10,
      search: 'john',
      role: 'Developer',
    });

    it('should return paginated contacts in audience list', async () => {
      const contacts = [
        {
          id: 'contact1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      ];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([contacts, 1]);

      const result = await service.findAudienceListContacts(
        audienceListId,
        params
      );

      expect(result).toEqual({
        data: contacts,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
      expect(result.data).toEqual(contacts);
      expect(mockContactRepository.createQueryBuilder).toHaveBeenCalledWith(
        'contact'
      );
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(
        'contact.audienceListMembers',
        'audienceListMember'
      );
    });

    it('should apply search filters correctly', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAudienceListContacts(audienceListId, params);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('contact.search_vector'),
        expect.objectContaining({
          ftsQuery: 'john:*',
          partialMatchQuery: '%john%',
        })
      );
    });

    it('should apply role filter correctly', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAudienceListContacts(audienceListId, params);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'contact.role = :role',
        { role: 'Developer' }
      );
    });

    it('should work without search parameter', async () => {
      const noSearchParams = new ContactListParamsDto();
      Object.assign(noSearchParams, {
        page: 1,
        limit: 10,
        role: 'Developer',
      });

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAudienceListContacts(audienceListId, noSearchParams);

      // Verify search filter is not applied
      const calls = mockQueryBuilder.andWhere.mock.calls;
      const searchCall = calls.find(
        (call) => call[0] && call[0].includes('search_vector')
      );
      expect(searchCall).toBeUndefined();
    });

    it('should work without any filters', async () => {
      const noFiltersParams = new ContactListParamsDto();
      Object.assign(noFiltersParams, {
        page: 1,
        limit: 10,
      });

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAudienceListContacts(audienceListId, noFiltersParams);

      // Should only have base where conditions and no additional filters
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'audienceListMember.audienceListId = :audienceListId',
        { audienceListId }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'contact.locationId = :locationId',
        { locationId: 'test-location-id' }
      );
    });

    it('should apply all filters when provided', async () => {
      const allFiltersParams = new ContactListParamsDto();
      Object.assign(allFiltersParams, {
        page: 1,
        limit: 10,
        search: 'john',
        role: 'Developer',
        company: 'Tech Corp',
        location: 'New York',
        industry: 'Technology',
      });

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAudienceListContacts(audienceListId, allFiltersParams);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'contact.role = :role',
        { role: 'Developer' }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'contact.company = :company',
        { company: 'Tech Corp' }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'contact.location = :location',
        { location: 'New York' }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'contact.industry = :industry',
        { industry: 'Technology' }
      );
    });

    it('should work without sort parameter', async () => {
      const noSortParams = new ContactListParamsDto();
      Object.assign(noSortParams, {
        page: 1,
        limit: 10,
      });

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAudienceListContacts(audienceListId, noSortParams);

      // Since the method has default sort = 'createdAt:desc', orderBy should be called
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'contact.createdAt',
        'DESC'
      );
    });

    it('should handle regular field sorting vs special field sorting', async () => {
      // Test for line 109 - the ternary operator in findAll that handles special sorting fields
      const regularSortParams = new AudienceListParamsDto();
      Object.assign(regularSortParams, {
        page: 1,
        limit: 10,
        sort: 'name:asc', // Regular field that should use audienceList.name
      });

      const entities = [];
      const raw = [];

      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities, raw });

      await service.findAll(regularSortParams);

      // Should use audienceList.name (not quoted)
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'audienceList.name',
        'ASC'
      );

      // Now test the other branch with special fields
      jest.clearAllMocks();

      const specialSortParams = new AudienceListParamsDto();
      Object.assign(specialSortParams, {
        page: 1,
        limit: 10,
        sort: 'usedInCount:desc', // Special field that should be quoted
      });

      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities, raw });

      await service.findAll(specialSortParams);

      // Should use quoted "usedInCount"
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        '"usedInCount"',
        'DESC'
      );
    });

    it('should test both branches of folder conditional (line 74)', async () => {
      // Test the if branch (when folder is provided)
      const withFolderParams = new AudienceListParamsDto();
      Object.assign(withFolderParams, {
        page: 1,
        limit: 10,
        folder: 'test-folder',
      });

      const entities = [];
      const raw = [];

      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities, raw });

      await service.findAll(withFolderParams);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'audienceList.folder = :folder',
        { folder: 'test-folder' }
      );

      // Clear mocks and test the else branch
      jest.clearAllMocks();

      const withoutFolderParams = new AudienceListParamsDto();
      Object.assign(withoutFolderParams, {
        page: 1,
        limit: 10,
        // No folder parameter
      });

      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities, raw });

      await service.findAll(withoutFolderParams);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'audienceList.folder IS NULL'
      );
    });

    it('should test ternary operators in data mapping for memberCount and usedInCount', async () => {
      // Test when rawAudienceList exists (first branch of ternary)
      const entities = [mockAudienceList];
      const raw = [
        {
          audienceList_id: 'test-uuid',
          memberCount: '10',
          usedInCount: '5',
        },
      ];

      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities, raw });

      const result = await service.findAll(params);

      expect(result.data[0]).toEqual({
        ...mockAudienceList,
        memberCount: 10, // Should parse the string to int
        usedInCount: 5, // Should parse the string to int
      });

      // Test when rawAudienceList doesn't exist (second branch of ternary)
      jest.clearAllMocks();

      const entitiesNoRaw = [mockAudienceList];
      const rawNoMatch = []; // No matching raw data

      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({
        entities: entitiesNoRaw,
        raw: rawNoMatch,
      });

      const resultNoRaw = await service.findAll(params);

      expect(resultNoRaw.data[0]).toEqual({
        ...mockAudienceList,
        memberCount: 0, // Should default to 0
        usedInCount: 0, // Should default to 0
      });
    });

    it('should test the exact else clause on line 109 when sort is undefined', async () => {
      // Test the exact else clause on line 109 - when sort is completely undefined
      const noSortParams = new AudienceListParamsDto();
      Object.assign(noSortParams, {
        page: 1,
        limit: 10,
        // sort is intentionally undefined to trigger line 109
      });

      const entities = [];
      const raw = [];

      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities, raw });

      await service.findAll(noSortParams);

      // This should trigger the else clause on line 109: query.orderBy('audienceList.createdAt', 'DESC');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'audienceList.createdAt',
        'DESC'
      );
    });

    it('should test line 74 - subquery memberCount execution path', async () => {
      // Test that ensures the subquery on line 74 gets executed
      // This tests the specific addSelect subquery path
      const paramsForSubquery = new AudienceListParamsDto();
      Object.assign(paramsForSubquery, {
        page: 1,
        limit: 10,
      });

      const entities = [mockAudienceList];
      const raw = [
        {
          audienceList_id: 'test-uuid',
          memberCount: '3', // This should trigger the subquery path
          usedInCount: '1',
        },
      ];

      mockQueryBuilder.getCount.mockResolvedValue(1);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities, raw });

      const result = await service.findAll(paramsForSubquery);

      // Verify the subquery result is processed correctly
      expect(result.data[0].memberCount).toBe(3);
      expect(
        mockAudienceListRepository.createQueryBuilder
      ).toHaveBeenCalledWith('audienceList');
      expect(mockQueryBuilder.addSelect).toHaveBeenCalled();
    });

    it('should test null sort parameter to trigger line 109', async () => {
      // Test specifically with null sort to trigger the else clause
      const nullSortParams = new AudienceListParamsDto();
      Object.assign(nullSortParams, {
        page: 1,
        limit: 10,
        sort: null, // Explicitly null to trigger else branch
      });

      const entities = [];
      const raw = [];

      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities, raw });

      await service.findAll(nullSortParams);

      // Should trigger line 109: query.orderBy('audienceList.createdAt', 'DESC');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'audienceList.createdAt',
        'DESC'
      );
    });

    it('should test empty string sort parameter to trigger line 109', async () => {
      // Test with empty string sort to trigger the else clause
      const emptySortParams = new AudienceListParamsDto();
      Object.assign(emptySortParams, {
        page: 1,
        limit: 10,
        sort: '', // Empty string to trigger else branch
      });

      const entities = [];
      const raw = [];

      mockQueryBuilder.getCount.mockResolvedValue(0);
      mockQueryBuilder.getRawAndEntities.mockResolvedValue({ entities, raw });

      await service.findAll(emptySortParams);

      // Should trigger line 109: query.orderBy('audienceList.createdAt', 'DESC');
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'audienceList.createdAt',
        'DESC'
      );
    });

    it('should apply sorting when sort parameter provided', async () => {
      const sortParams = new ContactListParamsDto();
      Object.assign(sortParams, {
        page: 1,
        limit: 10,
        sort: 'name:asc',
      });

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAudienceListContacts(audienceListId, sortParams);

      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'contact.name',
        'ASC'
      );
    });

    it('should apply partial filters', async () => {
      const partialFiltersParams = new ContactListParamsDto();
      Object.assign(partialFiltersParams, {
        page: 1,
        limit: 10,
        company: 'Tech Corp',
        industry: 'Technology',
      });

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAudienceListContacts(
        audienceListId,
        partialFiltersParams
      );

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'contact.company = :company',
        { company: 'Tech Corp' }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'contact.industry = :industry',
        { industry: 'Technology' }
      );

      // Role and location should not be called
      const calls = mockQueryBuilder.andWhere.mock.calls;
      const roleCall = calls.find((call) => call[0] === 'contact.role = :role');
      const locationCall = calls.find(
        (call) => call[0] === 'contact.location = :location'
      );
      expect(roleCall).toBeUndefined();
      expect(locationCall).toBeUndefined();
    });
  });
});
