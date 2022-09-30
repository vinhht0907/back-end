import { Test, TestingModule } from '@nestjs/testing';
import { SuperMemoService } from './super-memo.service';

describe('SuperMemoService', () => {
  let service: SuperMemoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SuperMemoService],
    }).compile();

    service = module.get<SuperMemoService>(SuperMemoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
