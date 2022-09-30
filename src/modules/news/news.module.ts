import { Global, Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { NewsSchema } from '@/modules/news/news.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'News', schema: NewsSchema, collection: 'news' },
    ]),
  ],
  providers: [NewsService],
  controllers: [NewsController],
  exports: [NewsService],
})
export class NewsModule {}
