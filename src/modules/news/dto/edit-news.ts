import { Allow } from 'class-validator';
import { CreateNews } from '@/modules/news/dto/create-news';

export class EditNews extends CreateNews {
  @Allow()
  private id?: string;
}
