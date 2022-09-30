import { forwardRef, Module } from '@nestjs/common';
import { TopicController } from './topic.controller';
import { TopicService } from './topic.service';
import {MongooseModule} from "@nestjs/mongoose";
import {TopicSchema} from "@/modules/topic/topic.schema";
import { ResourceModule } from '@/modules/resource/resource.module';
import { KeywordModule } from '@/modules/keyword/keyword.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Topic', schema: TopicSchema, collection: 'topics' },
    ]),
    forwardRef(()=>ResourceModule),
    forwardRef(()=>KeywordModule)
  ],
  controllers: [TopicController],
  providers: [TopicService],
  exports: [TopicService]
})
export class TopicModule {}
