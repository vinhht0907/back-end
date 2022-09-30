import { Allow } from 'class-validator';
import { CreateCategory } from '@/modules/category/dto/create-category';

export class EditCategory extends CreateCategory{
  @Allow()
  private id?: string
}
