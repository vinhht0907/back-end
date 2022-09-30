import { Module } from '@nestjs/common';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { MongooseModule } from '@nestjs/mongoose';
import { NewsLetterSchema } from '@/modules/newsletter/newsletter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'NewsLetter', schema: NewsLetterSchema, collection: 'news_letters' },
    ]),
  ],
  controllers: [NewsletterController],
  providers: [NewsletterService],
  exports:[NewsletterService]
})
export class NewsletterModule {}
