import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CategorySchema } from '@/modules/category/category.schema';
import {IsCategoryAlreadyExist} from '@/modules/category/dto/validation/is-category-already-exist';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Category', schema: CategorySchema, collection: 'categories' },
    ]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService, IsCategoryAlreadyExist],
  exports: [CategoryService]
})
export class CategoryModule {}
