import { Global, Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MulterS3ConfigService } from '@/common/service/multer-s3-config.service';
import { CacheModule } from '../cache/cache.module';
import { UsersModule } from '@/modules/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaSchema } from '@/modules/media/media.schema';

@Global()
@Module({
  imports: [
    CacheModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: 'Media', schema: MediaSchema, collection: 'media' },
    ]),
  ],
  controllers: [MediaController],
  providers: [MediaService, MulterS3ConfigService],
  exports: [MediaService],
})
export class MediaModule {}
