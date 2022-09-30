import { Test, TestingModule } from '@nestjs/testing';
import { PostViewService } from './post-view.service';

describe('PostViewService', () => {
  let service: PostViewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostViewService],
    }).compile();

    service = module.get<PostViewService>(PostViewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
