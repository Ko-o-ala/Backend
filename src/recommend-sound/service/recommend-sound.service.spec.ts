import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { RecommendSoundService } from './recommend-sound.service';
import { UsersRepository } from '../../users/users.repository';
import { SleepDataService } from '../../sleep-data/service/sleep-data.service';

describe('RecommendSoundService', () => {
  let service: RecommendSoundService;
  let usersRepository: jest.Mocked<UsersRepository>;
  let sleepDataService: jest.Mocked<SleepDataService>;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const mockUsersRepository = {
      findByUserID: jest.fn(),
    };

    const mockSleepDataService = {
      getSleepDataByDate: jest.fn(),
    };

    const mockHttpService = {
      post: jest.fn(),
    };

    const mockRecommendSoundModel = {
      new: jest.fn().mockReturnValue({
        save: jest.fn(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendSoundService,
        {
          provide: getModelToken('RecommendSound'),
          useValue: mockRecommendSoundModel,
        },
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
        {
          provide: SleepDataService,
          useValue: mockSleepDataService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<RecommendSoundService>(RecommendSoundService);
    usersRepository = module.get(UsersRepository);
    sleepDataService = module.get(SleepDataService);
    httpService = module.get(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have all dependencies injected', () => {
    expect(usersRepository).toBeDefined();
    expect(sleepDataService).toBeDefined();
    expect(httpService).toBeDefined();
  });
});
