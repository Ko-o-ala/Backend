import { Test, TestingModule } from '@nestjs/testing';
import { RecommendSoundService } from './recommend-sound.service';

describe('RecommendSoundService', () => {
  let service: RecommendSoundService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecommendSoundService],
    }).compile();

    service = module.get<RecommendSoundService>(RecommendSoundService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
