import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto } from './dto/contact.dto';
import { ContactListParamsDto } from './dto/contact-list-params.dto';
import { Contact } from '../../entities/contact.entity';
import { PaginatedResponseDto } from '@stamina-project/common';
import { Industry } from '@stamina-project/types';

describe('ContactsController', () => {
  let controller: ContactsController;

  const mockContactsService = {
    create: jest.fn(),
    createBatch: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findUniqueLocations: jest.fn(),
    findUniqueCompanies: jest.fn(),
    searchAttributes: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeBatch: jest.fn(),
    queueCsvProcessingJob: jest.fn(),
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
      controllers: [ContactsController],
      providers: [
        {
          provide: ContactsService,
          useValue: mockContactsService,
        },
      ],
    }).compile();

    controller = module.get<ContactsController>(ContactsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createContactDto: CreateContactDto = {
      locationId: 'test-location-id',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Developer',
      company: 'Test Company',
      location: 'Test City',
      industry: Industry.TECHNOLOGY,
      avatar: 'avatar.png',
    };

    it('should create a contact successfully', async () => {
      mockContactsService.create.mockResolvedValue(mockContact);

      const result = await controller.create(createContactDto);

      expect(result).toEqual(mockContact);
      expect(mockContactsService.create).toHaveBeenCalledWith(createContactDto);
      expect(mockContactsService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const error = new BadRequestException('Invalid contact data');
      mockContactsService.create.mockRejectedValue(error);

      await expect(controller.create(createContactDto)).rejects.toThrow(error);
      expect(mockContactsService.create).toHaveBeenCalledWith(createContactDto);
    });
  });

  describe('createBatch', () => {
    const createContactDtos: CreateContactDto[] = [
      {
        locationId: 'test-location-id',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Developer',
        company: 'Test Company',
        location: 'Test City',
        industry: Industry.TECHNOLOGY,
        avatar: 'avatar.png',
      },
    ];

    it('should create multiple contacts successfully', async () => {
      const expectedContacts = [mockContact];
      mockContactsService.createBatch.mockResolvedValue(expectedContacts);

      const result = await controller.createBatch(createContactDtos);

      expect(result).toEqual(expectedContacts);
      expect(mockContactsService.createBatch).toHaveBeenCalledWith(
        createContactDtos
      );
    });
  });

  describe('findAll', () => {
    const params = new ContactListParamsDto();
    Object.assign(params, {
      page: 1,
      limit: 10,
      search: 'test',
    });
    params.role = 'Developer';

    it('should return paginated contacts', async () => {
      const paginatedResult = PaginatedResponseDto.create(
        [mockContact],
        1,
        params
      );
      mockContactsService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(params);

      expect(result).toEqual(paginatedResult);
      expect(mockContactsService.findAll).toHaveBeenCalledWith(params);
    });

    it('should handle empty results', async () => {
      const emptyResult = PaginatedResponseDto.create([], 0, params);
      mockContactsService.findAll.mockResolvedValue(emptyResult);

      const result = await controller.findAll(params);

      expect(result).toEqual(emptyResult);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    const contactId = 'test-uuid';

    it('should return a contact by id', async () => {
      mockContactsService.findOne.mockResolvedValue(mockContact);

      const result = await controller.findOne(contactId);

      expect(result).toEqual(mockContact);
      expect(mockContactsService.findOne).toHaveBeenCalledWith(contactId);
    });

    it('should throw NotFoundException when contact not found', async () => {
      const error = new NotFoundException(
        `Contact with ID "${contactId}" not found`
      );
      mockContactsService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(contactId)).rejects.toThrow(error);
    });
  });

  describe('findUniqueLocations', () => {
    it('should return unique locations', async () => {
      const locations = ['New York', 'San Francisco', 'London'];
      mockContactsService.findUniqueLocations.mockResolvedValue(locations);

      const result = await controller.findUniqueLocations();

      expect(result).toEqual(locations);
      expect(mockContactsService.findUniqueLocations).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no locations found', async () => {
      mockContactsService.findUniqueLocations.mockResolvedValue([]);

      const result = await controller.findUniqueLocations();

      expect(result).toEqual([]);
    });
  });

  describe('findUniqueCompanies', () => {
    it('should return unique companies', async () => {
      const companies = ['Tech Corp', 'Innovation Inc', 'Startup LLC'];
      mockContactsService.findUniqueCompanies.mockResolvedValue(companies);

      const result = await controller.findUniqueCompanies();

      expect(result).toEqual(companies);
      expect(mockContactsService.findUniqueCompanies).toHaveBeenCalledTimes(1);
    });
  });

  describe('searchAttributes', () => {
    it('should search company attributes', async () => {
      const companies = ['Tech Corp', 'Technology Inc'];
      mockContactsService.searchAttributes.mockResolvedValue(companies);

      const result = await controller.searchAttributes('company', 'tech');

      expect(result).toEqual(companies);
      expect(mockContactsService.searchAttributes).toHaveBeenCalledWith(
        'company',
        'tech',
        undefined,
        undefined
      );
    });

    it('should search with custom limit and page', async () => {
      const companies = ['Tech Corp'];
      mockContactsService.searchAttributes.mockResolvedValue(companies);

      const result = await controller.searchAttributes('company', 'tech', 3, 2);

      expect(result).toEqual(companies);
      expect(mockContactsService.searchAttributes).toHaveBeenCalledWith(
        'company',
        'tech',
        3,
        2
      );
    });
  });

  describe('update', () => {
    const contactId = 'test-uuid';
    const updateContactDto: UpdateContactDto = {
      locationId: 'test-location-id',
      name: 'John Updated',
      email: 'john.updated@example.com',
      role: 'Senior Developer',
      location: 'Updated City',
      avatar: 'updated-avatar.png',
    };

    it('should update a contact successfully', async () => {
      const updatedContact = { ...mockContact, ...updateContactDto };
      mockContactsService.update.mockResolvedValue(updatedContact);

      const result = await controller.update(contactId, updateContactDto);

      expect(result).toEqual(updatedContact);
      expect(mockContactsService.update).toHaveBeenCalledWith(
        contactId,
        updateContactDto
      );
    });

    it('should handle update errors', async () => {
      const error = new NotFoundException(
        `Contact with ID "${contactId}" not found`
      );
      mockContactsService.update.mockRejectedValue(error);

      await expect(
        controller.update(contactId, updateContactDto)
      ).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    const contactId = 'test-uuid';

    it('should remove a contact successfully', async () => {
      mockContactsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(contactId);

      expect(result).toBeUndefined();
      expect(mockContactsService.remove).toHaveBeenCalledWith(contactId);
    });

    it('should handle remove errors', async () => {
      const error = new NotFoundException(
        `Contact with ID "${contactId}" not found`
      );
      mockContactsService.remove.mockRejectedValue(error);

      await expect(controller.remove(contactId)).rejects.toThrow(error);
    });
  });

  describe('removeBatch', () => {
    const contactIds = ['uuid1', 'uuid2', 'uuid3'];

    it('should remove multiple contacts successfully', async () => {
      mockContactsService.removeBatch.mockResolvedValue(undefined);

      const result = await controller.removeBatch(contactIds);

      expect(result).toBeUndefined();
      expect(mockContactsService.removeBatch).toHaveBeenCalledWith(contactIds);
    });

    it('should handle batch remove errors', async () => {
      const error = new NotFoundException(
        'No contacts found with the provided IDs.'
      );
      mockContactsService.removeBatch.mockRejectedValue(error);

      await expect(controller.removeBatch(contactIds)).rejects.toThrow(error);
    });
  });

  describe('processCsv', () => {
    const processCsvDto = {
      fileKey: 'test-file-key',
      mapping: { 'Full Name': 'name', 'Email Address': 'email' },
      audienceListId: 'test-audience-list-id',
    };

    it('should queue CSV processing job successfully', async () => {
      mockContactsService.queueCsvProcessingJob.mockResolvedValue(undefined);

      const result = await controller.processCsv(processCsvDto);

      expect(result).toEqual({
        message: 'CSV file is being processed.',
      });
      expect(mockContactsService.queueCsvProcessingJob).toHaveBeenCalledWith(
        processCsvDto
      );
    });

    it('should handle CSV processing errors', async () => {
      const error = new BadRequestException('Invalid CSV file');
      mockContactsService.queueCsvProcessingJob.mockRejectedValue(error);

      await expect(controller.processCsv(processCsvDto)).rejects.toThrow(error);
    });
  });
});
