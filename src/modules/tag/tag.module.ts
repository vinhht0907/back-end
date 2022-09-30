import { Module } from '@nestjs/common';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TagSchema } from '@/modules/tag/tag.schema';
import { IsTagAlreadyExist } from '@/modules/tag/dto/validation/is-tag-already-exist';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Tag', schema: TagSchema, collection: 'tags' },
    ]),
  ],
  controllers: [TagController],
  providers: [TagService, IsTagAlreadyExist],
  exports: [TagService]
})
export class TagModule {}
