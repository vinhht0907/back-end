import { Test, TestingModule } from '@nestjs/testing';
import { QueueTaskService } from './queue-task.service';

describe('QueueTaskService', () => {
  let service: QueueTaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueueTaskService],
    }).compile();

    service = module.get<QueueTaskService>(QueueTaskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
