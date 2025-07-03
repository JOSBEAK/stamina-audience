import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;

  const mockAppService = {
    getData: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getData', () => {
    it('should return data from service', () => {
      const expectedData = { message: 'Hello API' };
      mockAppService.getData.mockReturnValue(expectedData);

      const result = controller.getData();

      expect(result).toEqual(expectedData);
      expect(mockAppService.getData).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors gracefully', () => {
      const error = new Error('Service error');
      mockAppService.getData.mockImplementation(() => {
        throw error;
      });

      expect(() => controller.getData()).toThrow(error);
      expect(mockAppService.getData).toHaveBeenCalledTimes(1);
    });
  });
});
