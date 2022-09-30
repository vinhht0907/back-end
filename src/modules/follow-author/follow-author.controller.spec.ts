import { Test, TestingModule } from '@nestjs/testing';
import { FollowAuthorController } from './follow-author.controller';

describe('FollowAuthor Controller', () => {
  let controller: FollowAuthorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowAuthorController],
    }).compile();

    controller = module.get<FollowAuthorController>(FollowAuthorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
