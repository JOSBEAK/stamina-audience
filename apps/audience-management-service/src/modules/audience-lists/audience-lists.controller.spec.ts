import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AudienceListsController } from './audience-lists.controller';
import { AudienceListsService } from './audience-lists.service';
import {
  CreateAudienceListDto,
  AddContactsToAudienceListDto,
} from './dto/audience-list.dto';
import { AudienceListParamsDto } from './dto/audience-list-params.dto';
import { ContactListParamsDto } from '../contacts/dto/contact-list-params.dto';
import {
  AudienceList,
  AudienceListType,
} from '../../entities/audience-list.entity';
import { PaginatedResponseDto } from '@stamina-project/common';

describe('AudienceListsController', () => {
  let controller: AudienceListsController;

  const mockAudienceListsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findDeleted: jest.fn(),
    findFolders: jest.fn(),
    findOne: jest.fn(),
    findAudienceListContacts: jest.fn(),
    addContactsToAudienceList: jest.fn(),
    removeContactsFromAudienceList: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
  };

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
      controllers: [AudienceListsController],
      providers: [
        {
          provide: AudienceListsService,
          useValue: mockAudienceListsService,
        },
      ],
    }).compile();

    controller = module.get<AudienceListsController>(AudienceListsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createAudienceListDto: CreateAudienceListDto = {
      name: 'Test Audience List',
      type: AudienceListType.STATIC,
    };

    it('should create an audience list successfully', async () => {
      mockAudienceListsService.create.mockResolvedValue(mockAudienceList);

      const result = await controller.create(createAudienceListDto);

      expect(result).toEqual(mockAudienceList);
      expect(mockAudienceListsService.create).toHaveBeenCalledWith(
        createAudienceListDto
      );
      expect(mockAudienceListsService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockAudienceListsService.create.mockRejectedValue(error);

      await expect(controller.create(createAudienceListDto)).rejects.toThrow(
        error
      );
    });
  });

  describe('findAll', () => {
    const params = new AudienceListParamsDto();
    Object.assign(params, {
      page: 1,
      limit: 10,
      search: 'test',
    });
    params.folder = 'test-folder';

    it('should return paginated audience lists', async () => {
      const paginatedResult = PaginatedResponseDto.create(
        [mockAudienceList],
        1,
        params
      );
      mockAudienceListsService.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll(params);

      expect(result).toEqual(paginatedResult);
      expect(mockAudienceListsService.findAll).toHaveBeenCalledWith(params);
    });

    it('should handle empty params', async () => {
      const emptyParams = new AudienceListParamsDto();
      const emptyResult = PaginatedResponseDto.create([], 0, emptyParams);
      mockAudienceListsService.findAll.mockResolvedValue(emptyResult);

      const result = await controller.findAll(emptyParams);

      expect(result).toEqual(emptyResult);
    });
  });

  describe('findDeleted', () => {
    const params = new AudienceListParamsDto();
    Object.assign(params, {
      page: 1,
      limit: 10,
    });

    it('should return paginated deleted audience lists', async () => {
      const deletedList = { ...mockAudienceList, deletedAt: new Date() };
      const paginatedResult = PaginatedResponseDto.create(
        [deletedList],
        1,
        params
      );
      mockAudienceListsService.findDeleted.mockResolvedValue(paginatedResult);

      const result = await controller.findDeleted(params);

      expect(result).toEqual(paginatedResult);
      expect(mockAudienceListsService.findDeleted).toHaveBeenCalledWith(params);
    });
  });

  describe('findFolders', () => {
    it('should return unique folder names', async () => {
      const folders = ['folder1', 'folder2', 'folder3'];
      mockAudienceListsService.findFolders.mockResolvedValue(folders);

      const result = await controller.findFolders();

      expect(result).toEqual(folders);
      expect(mockAudienceListsService.findFolders).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no folders found', async () => {
      mockAudienceListsService.findFolders.mockResolvedValue([]);

      const result = await controller.findFolders();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    const audienceListId = 'test-uuid';

    it('should return an audience list by id', async () => {
      mockAudienceListsService.findOne.mockResolvedValue(mockAudienceList);

      const result = await controller.findOne(audienceListId);

      expect(result).toEqual(mockAudienceList);
      expect(mockAudienceListsService.findOne).toHaveBeenCalledWith(
        audienceListId
      );
    });

    it('should handle not found case', async () => {
      mockAudienceListsService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(audienceListId);

      expect(result).toBeNull();
    });
  });

  describe('findAudienceListContacts', () => {
    const audienceListId = 'test-uuid';
    const params = new ContactListParamsDto();
    Object.assign(params, {
      page: 1,
      limit: 10,
      search: 'test',
    });
    params.role = 'Developer';

    it('should return paginated contacts in audience list', async () => {
      const contacts = [
        {
          id: 'contact1',
          name: 'John Doe',
          email: 'john@example.com',
        },
      ];
      const paginatedResult = PaginatedResponseDto.create(contacts, 1, params);
      mockAudienceListsService.findAudienceListContacts.mockResolvedValue(
        paginatedResult
      );

      const result = await controller.findAudienceListContacts(
        audienceListId,
        params
      );

      expect(result).toEqual(paginatedResult);
      expect(
        mockAudienceListsService.findAudienceListContacts
      ).toHaveBeenCalledWith(audienceListId, params);
    });

    it('should handle empty results', async () => {
      const emptyResult = PaginatedResponseDto.create([], 0, params);
      mockAudienceListsService.findAudienceListContacts.mockResolvedValue(
        emptyResult
      );

      const result = await controller.findAudienceListContacts(
        audienceListId,
        params
      );

      expect(result).toEqual(emptyResult);
    });
  });

  describe('addContactsToAudienceList', () => {
    const audienceListId = 'test-uuid';
    const addContactsDto: AddContactsToAudienceListDto = {
      contactIds: ['contact1', 'contact2'],
    };

    it('should add contacts to audience list successfully', async () => {
      mockAudienceListsService.addContactsToAudienceList.mockResolvedValue({
        success: true,
      });

      const result = await controller.addContactsToAudienceList(
        audienceListId,
        addContactsDto
      );

      expect(result).toEqual({ success: true });
      expect(
        mockAudienceListsService.addContactsToAudienceList
      ).toHaveBeenCalledWith(audienceListId, addContactsDto);
    });

    it('should handle service errors', async () => {
      const error = new NotFoundException('Audience list not found');
      mockAudienceListsService.addContactsToAudienceList.mockRejectedValue(
        error
      );

      await expect(
        controller.addContactsToAudienceList(audienceListId, addContactsDto)
      ).rejects.toThrow(error);
    });
  });

  describe('removeContactsFromAudienceList', () => {
    const audienceListId = 'test-uuid';
    const body = { contactIds: ['contact1', 'contact2'] };

    it('should remove contacts from audience list successfully', async () => {
      mockAudienceListsService.removeContactsFromAudienceList.mockResolvedValue(
        undefined
      );

      const result = await controller.removeContactsFromAudienceList(
        audienceListId,
        body
      );

      expect(result).toBeUndefined();
      expect(
        mockAudienceListsService.removeContactsFromAudienceList
      ).toHaveBeenCalledWith(audienceListId, body.contactIds);
    });

    it('should handle empty contact ids', async () => {
      const emptyBody = { contactIds: [] };
      mockAudienceListsService.removeContactsFromAudienceList.mockResolvedValue(
        undefined
      );

      const result = await controller.removeContactsFromAudienceList(
        audienceListId,
        emptyBody
      );

      expect(result).toBeUndefined();
      expect(
        mockAudienceListsService.removeContactsFromAudienceList
      ).toHaveBeenCalledWith(audienceListId, []);
    });
  });

  describe('softDelete', () => {
    const audienceListId = 'test-uuid';

    it('should soft delete an audience list successfully', async () => {
      mockAudienceListsService.softDelete.mockResolvedValue(undefined);

      const result = await controller.softDelete(audienceListId);

      expect(result).toBeUndefined();
      expect(mockAudienceListsService.softDelete).toHaveBeenCalledWith(
        audienceListId
      );
    });

    it('should handle service errors', async () => {
      const error = new NotFoundException('Audience list not found');
      mockAudienceListsService.softDelete.mockRejectedValue(error);

      await expect(controller.softDelete(audienceListId)).rejects.toThrow(
        error
      );
    });
  });

  describe('restore', () => {
    const audienceListId = 'test-uuid';

    it('should restore a deleted audience list successfully', async () => {
      mockAudienceListsService.restore.mockResolvedValue(undefined);

      const result = await controller.restore(audienceListId);

      expect(result).toBeUndefined();
      expect(mockAudienceListsService.restore).toHaveBeenCalledWith(
        audienceListId
      );
    });

    it('should handle service errors', async () => {
      const error = new NotFoundException('Audience list not found');
      mockAudienceListsService.restore.mockRejectedValue(error);

      await expect(controller.restore(audienceListId)).rejects.toThrow(error);
    });
  });
});
