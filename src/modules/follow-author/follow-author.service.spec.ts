import { Test, TestingModule } from '@nestjs/testing';
import { FollowAuthorService } from './follow-author.service';

describe('FollowAuthorService', () => {
  let service: FollowAuthorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FollowAuthorService],
    }).compile();

    service = module.get<FollowAuthorService>(FollowAuthorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
