import { Test, TestingModule } from '@nestjs/testing';
import { QueueTaskController } from './queue-task.controller';

describe('QueueTask Controller', () => {
  let controller: QueueTaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueueTaskController],
    }).compile();

    controller = module.get<QueueTaskController>(QueueTaskController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
