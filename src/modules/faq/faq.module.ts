import { Module } from '@nestjs/common';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FaqSchema } from '@/modules/faq/faq.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Faq', schema: FaqSchema, collection: 'faqs' },
    ]),
  ],
  controllers: [FaqController],
  providers: [FaqService]
})
export class FaqModule {}
