import { forwardRef, Module } from '@nestjs/common';
import { KeywordController } from './keyword.controller';
import { KeywordService } from './keyword.service';
import { MongooseModule } from '@nestjs/mongoose';
import { KeywordSchema } from '@/modules/keyword/keyword.schema';
import { TopicModule } from '@/modules/topic/topic.module';
import { IsKeywordAlreadyExist } from '@/modules/keyword/dto/validation/is-keyword-already-exist';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Keyword', schema: KeywordSchema, collection: 'keywords' },
    ]),
    forwardRef(() => TopicModule),
  ],
  controllers: [KeywordController],
  providers: [KeywordService, IsKeywordAlreadyExist],
  exports: [KeywordService],
})
export class KeywordModule {
}
