import { Test, TestingModule } from '@nestjs/testing';
import { MulterS3ConfigService } from './multer-s3-config.service';

describe('MulterS3ConfigServiceService', () => {
  let service: MulterS3ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MulterS3ConfigService],
    }).compile();

    service = module.get<MulterS3ConfigService>(MulterS3ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
