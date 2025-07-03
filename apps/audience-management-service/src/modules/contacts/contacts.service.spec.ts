import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactsService } from './contacts.service';
import { Contact } from '../../entities/contact.entity';
import { CreateContactDto } from './dto/contact.dto';
import { NotFoundException } from '@nestjs/common';

describe('ContactsService', () => {
  let service: ContactsService;
  let repository: Repository<Contact>;

  const mockContactRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactsService,
        {
          provide: getRepositoryToken(Contact),
          useValue: mockContactRepository,
        },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
    repository = module.get<Repository<Contact>>(getRepositoryToken(Contact));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create and save a contact', async () => {
      const createContactDto: CreateContactDto = {
        locationId: 'test-location-id',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'Tester',
        location: 'Test City',
        avatar: 'avatar.png',
      };
      const expectedContact = { id: 'some-uuid', ...createContactDto };

      mockContactRepository.create.mockReturnValue(createContactDto);
      mockContactRepository.save.mockResolvedValue(expectedContact);

      const result = await service.create(createContactDto);

      expect(mockContactRepository.create).toHaveBeenCalledWith(
        createContactDto
      );
      expect(mockContactRepository.save).toHaveBeenCalledWith(createContactDto);
      expect(result).toEqual(expectedContact);
    });
  });

  describe('findOne', () => {
    it('should return a contact if found', async () => {
      const contactId = 'some-uuid';
      const expectedContact = {
        id: contactId,
        name: 'John Doe',
        email: 'john@doe.com',
      };

      mockContactRepository.findOneBy.mockResolvedValue(expectedContact);
      const result = await service.findOne(contactId);
      expect(result).toEqual(expectedContact);
      expect(mockContactRepository.findOneBy).toHaveBeenCalledWith({
        id: contactId,
      });
    });

    it('should throw a NotFoundException if the contact is not found', async () => {
      const contactId = 'non-existent-uuid';
      mockContactRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(contactId)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
