import { Allow } from 'class-validator';
import { CreateFaq } from '@/modules/faq/dto/create-faq';

export class EditFaq extends CreateFaq{
  @Allow()
  private id?: string
}
