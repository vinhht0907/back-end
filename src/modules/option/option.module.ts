import { Global, Module } from '@nestjs/common';
import { OptionService } from './option.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OptionSchema } from '@/modules/option/option.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Option', schema: OptionSchema, collection: 'options' },
    ]),
  ],
  providers: [OptionService],
  exports: [OptionService]
})
export class OptionModule {}
