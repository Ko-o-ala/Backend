import { Test, TestingModule } from '@nestjs/testing';
import { RecommendSoundController } from './recommend-sound.controller';
import { RecommendSoundService } from '../service/recommend-sound.service';

describe('RecommendSoundController', () => {
  let controller: RecommendSoundController;
  let recommendSoundService: jest.Mocked<RecommendSoundService>;

  beforeEach(async () => {
    const mockRecommendSoundService = {
      executeRecommendation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommendSoundController],
      providers: [
        {
          provide: RecommendSoundService,
          useValue: mockRecommendSoundService,
        },
      ],
    }).compile();

    controller = module.get<RecommendSoundController>(RecommendSoundController);
    recommendSoundService = module.get(RecommendSoundService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have recommendSoundService injected', () => {
    expect(recommendSoundService).toBeDefined();
  });
});
