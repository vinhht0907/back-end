import { Test, TestingModule } from '@nestjs/testing';
import { FaqController } from './faq.controller';

describe('Faq Controller', () => {
  let controller: FaqController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FaqController],
    }).compile();

    controller = module.get<FaqController>(FaqController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
