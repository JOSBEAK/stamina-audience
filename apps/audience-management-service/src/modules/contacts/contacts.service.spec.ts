import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SqsService } from '@ssut/nestjs-sqs';
import { ContactsService } from './contacts.service';
import { Contact } from '../../entities/contact.entity';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';
import { ContactListParamsDto } from './dto/contact-list-params.dto';
import { Industry } from '@stamina-project/types';

describe('ContactsService', () => {
  let service: ContactsService;
  let repository: Repository<Contact>;
  let configService: ConfigService;
  let sqsService: SqsService;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
    getRawMany: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
  };

  const mockContactRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    delete: jest.fn(),
    merge: jest.fn(),
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

  const mockSqsService = {
    send: jest.fn().mockResolvedValue(undefined),
  };

  const mockContact: Contact = {
    id: 'test-uuid',
    locationId: 'test-location-id',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Developer',
    company: 'Test Company',
    location: 'Test City',
    industry: 'Technology',
    avatar: 'avatar.png',
    createdAt: new Date(),
    updatedAt: new Date(),
    audienceListMembers: [],
    searchVector: '',
  } as Contact;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        {
          provide: getRepositoryToken(Contact),
          useValue: mockContactRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: SqsService,
          useValue: mockSqsService,
        },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
    repository = module.get<Repository<Contact>>(getRepositoryToken(Contact));
    configService = module.get<ConfigService>(ConfigService);
    sqsService = module.get<SqsService>(SqsService);

    mockConfigService.get.mockReturnValue('test-location-id');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error if LOCATION_ID is not set', () => {
    const tempConfigService = {
      get: jest.fn().mockReturnValue(undefined),
    };

    expect(() => {
      new ContactsService(
        repository,
        sqsService,
        tempConfigService as unknown as ConfigService
      );
    }).toThrow('LOCATION_ID is not set in the environment variables.');
  });

  describe('create', () => {
    const createContactDto: CreateContactDto = {
      locationId: 'test-location-id',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Developer',
      location: 'Test City',
      avatar: 'avatar.png',
      industry: Industry.TECHNOLOGY,
    };

    it('should successfully create and save a contact', async () => {
      const expectedContact = { id: 'some-uuid', ...createContactDto };

      mockContactRepository.create.mockReturnValue(createContactDto);
      mockContactRepository.save.mockResolvedValue(expectedContact);

      const result = await service.create(createContactDto);

      expect(mockContactRepository.create).toHaveBeenCalledWith({
        ...createContactDto,
        locationId: 'test-location-id',
      });
      expect(mockContactRepository.save).toHaveBeenCalledWith(createContactDto);
      expect(result).toEqual(expectedContact);
    });
  });

  describe('createBatch', () => {
    const createContactDtos: CreateContactDto[] = [
      {
        locationId: 'test-location-id',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Developer',
        location: 'Test City',
        avatar: 'avatar.png',
      },
      {
        locationId: 'test-location-id',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        role: 'Designer',
        location: 'Test City',
        avatar: 'avatar2.png',
      },
    ];

    it('should create multiple contacts successfully', async () => {
      const expectedContacts = createContactDtos.map((dto, index) => ({
        id: `uuid-${index}`,
        ...dto,
        locationId: 'test-location-id',
      }));

      mockContactRepository.create.mockImplementation((dto) => ({
        ...dto,
        locationId: 'test-location-id',
      }));
      mockContactRepository.save.mockResolvedValue(expectedContacts);

      const result = await service.createBatch(createContactDtos);

      expect(mockContactRepository.create).toHaveBeenCalledTimes(2);
      expect(mockContactRepository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ locationId: 'test-location-id' }),
        ])
      );
      expect(result).toEqual(expectedContacts);
    });
  });

  describe('findAll', () => {
    const params = new ContactListParamsDto();
    Object.assign(params, {
      page: 1,
      limit: 10,
      search: 'john',
      role: 'Developer',
    });

    it('should return paginated contacts', async () => {
      const contacts = [mockContact];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([contacts, 1]);

      const result = await service.findAll(params);

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
      expect(result.total).toBe(1);
      expect(mockContactRepository.createQueryBuilder).toHaveBeenCalledWith(
        'contact'
      );
    });

    it('should apply search filters correctly', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll(params);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'contact.role = :role',
        { role: 'Developer' }
      );
    });

    it('should handle empty results', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll(params);

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('findOne', () => {
    const contactId = 'test-uuid';

    it('should return a contact if found', async () => {
      mockContactRepository.findOneBy.mockResolvedValue(mockContact);

      const result = await service.findOne(contactId);

      expect(result).toEqual(mockContact);
      expect(mockContactRepository.findOneBy).toHaveBeenCalledWith({
        id: contactId,
        locationId: 'test-location-id',
      });
    });

    it('should throw a NotFoundException if the contact is not found', async () => {
      mockContactRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(contactId)).rejects.toThrow(
        NotFoundException
      );
      expect(mockContactRepository.findOneBy).toHaveBeenCalledWith({
        id: contactId,
        locationId: 'test-location-id',
      });
    });
  });

  describe('findUniqueLocations', () => {
    it('should return unique locations', async () => {
      const locations = [
        { location: 'New York' },
        { location: 'San Francisco' },
      ];
      mockQueryBuilder.getRawMany.mockResolvedValue(locations);

      const result = await service.findUniqueLocations();

      expect(result).toEqual(['New York', 'San Francisco']);
      expect(mockContactRepository.createQueryBuilder).toHaveBeenCalledWith(
        'contact'
      );
    });

    it('should return empty array when no locations found', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.findUniqueLocations();

      expect(result).toEqual([]);
    });
  });

  describe('findUniqueCompanies', () => {
    it('should return unique companies', async () => {
      const companies = [
        { company: 'Tech Corp' },
        { company: 'Innovation Inc' },
      ];
      mockQueryBuilder.getRawMany.mockResolvedValue(companies);

      const result = await service.findUniqueCompanies();

      expect(result).toEqual(['Tech Corp', 'Innovation Inc']);
      expect(mockContactRepository.createQueryBuilder).toHaveBeenCalledWith(
        'contact'
      );
    });
  });

  describe('searchAttributes', () => {
    it('should search company attributes', async () => {
      const companies = [
        { attribute: 'Tech Corp' },
        { attribute: 'Technology Inc' },
      ];
      mockQueryBuilder.getRawMany.mockResolvedValue(companies);

      const result = await service.searchAttributes('company', 'tech', 5, 1);

      expect(result).toEqual(['Tech Corp', 'Technology Inc']);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'contact.company ILIKE :search',
        { search: 'tech%' }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'contact.locationId = :locationId',
        { locationId: 'test-location-id' }
      );
    });

    it('should throw error for invalid attribute', async () => {
      await expect(service.searchAttributes('invalid', 'test')).rejects.toThrow(
        'Invalid attribute'
      );
    });
  });

  describe('update', () => {
    const contactId = 'test-uuid';
    const updateContactDto: UpdateContactDto = {
      name: 'John Updated',
      role: 'Senior Developer',
    } as UpdateContactDto;

    it('should update a contact successfully', async () => {
      const updatedContact = { ...mockContact, ...updateContactDto };

      mockContactRepository.findOneBy.mockResolvedValue(mockContact);
      mockContactRepository.merge.mockReturnValue(updatedContact);
      mockContactRepository.save.mockResolvedValue(updatedContact);

      const result = await service.update(contactId, updateContactDto);

      expect(result).toEqual(updatedContact);
      expect(mockContactRepository.merge).toHaveBeenCalledWith(
        mockContact,
        updateContactDto
      );
      expect(mockContactRepository.save).toHaveBeenCalledWith(updatedContact);
    });

    it('should throw NotFoundException when contact not found', async () => {
      mockContactRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(contactId, updateContactDto)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('remove', () => {
    const contactId = 'test-uuid';

    it('should remove a contact successfully', async () => {
      mockContactRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(contactId);

      expect(mockContactRepository.delete).toHaveBeenCalledWith({
        id: contactId,
        locationId: 'test-location-id',
      });
    });

    it('should throw NotFoundException when contact not found', async () => {
      mockContactRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(contactId)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('removeBatch', () => {
    const contactIds = ['uuid1', 'uuid2', 'uuid3'];

    it('should remove multiple contacts successfully', async () => {
      mockQueryBuilder.execute.mockResolvedValue({ affected: 3 });

      await service.removeBatch(contactIds);

      expect(mockContactRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });

    it('should throw NotFoundException when no contacts found', async () => {
      mockQueryBuilder.execute.mockResolvedValue({ affected: 0 });

      await expect(service.removeBatch(contactIds)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('queueCsvProcessingJob', () => {
    const job = {
      fileKey: 'test-file-key',
      mapping: { 'Full Name': 'name', 'Email Address': 'email' },
      audienceListId: 'test-audience-list-id',
    };

    it('should queue CSV processing job successfully', async () => {
      mockSqsService.send.mockResolvedValue(undefined);

      await service.queueCsvProcessingJob(job);

      expect(mockSqsService.send).toHaveBeenCalledWith(
        'csv-processing',
        expect.objectContaining({
          body: job,
          id: expect.any(String),
        })
      );
    });

    it('should throw error when SQS service is not available', async () => {
      const serviceWithoutSqs = new ContactsService(
        repository,
        null,
        configService
      );

      await expect(
        serviceWithoutSqs.queueCsvProcessingJob(job)
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('should handle SQS errors gracefully', async () => {
      const error = new Error('SQS error');
      mockSqsService.send.mockRejectedValue(error);

      await expect(service.queueCsvProcessingJob(job)).rejects.toThrow(
        'Could not queue CSV processing job.'
      );
    });
  });
});
