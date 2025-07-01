import { Test, TestingModule } from '@nestjs/testing';
import { SleepDataService } from './sleep-data.service';

describe('SleepDataService', () => {
  let service: SleepDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SleepDataService],
    }).compile();

    service = module.get<SleepDataService>(SleepDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
