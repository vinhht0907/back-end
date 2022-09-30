import { Module } from '@nestjs/common';
import { PageController } from './page.controller';
import { PageService } from './page.service';
import { MongooseModule } from '@nestjs/mongoose';
import { IsPageAlreadyExist } from '@/modules/page/dto/validation/is-page-already-exist';
import { PageSchema } from '@/modules/page/page.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Page', schema: PageSchema, collection: 'pages' },
    ]),
  ],
  controllers: [PageController],
  providers: [PageService, IsPageAlreadyExist],
  exports: [PageService],
})
export class PageModule {
}
