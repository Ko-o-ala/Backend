import { Test, TestingModule } from '@nestjs/testing';
import { RecommendSoundController } from './recommend-sound.controller';

describe('RecommendSoundController', () => {
  let controller: RecommendSoundController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommendSoundController],
    }).compile();

    controller = module.get<RecommendSoundController>(RecommendSoundController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
