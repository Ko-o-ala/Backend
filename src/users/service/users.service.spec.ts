import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from '../users.repository';
import { AuthService } from '../../auth/auth.service';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: jest.Mocked<UsersRepository>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockUsersRepository = {
      findByUserID: jest.fn(),
      updateSurvey: jest.fn(),
      findAll: jest.fn(),
      existByUserID: jest.fn(),
      create: jest.fn(),
      updateById: jest.fn(),
    };

    const mockAuthService = {
      getSignedJwtToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get(UsersRepository);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have usersRepository and authService injected', () => {
    expect(usersRepository).toBeDefined();
    expect(authService).toBeDefined();
  });
});
