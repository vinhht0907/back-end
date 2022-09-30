import { Allow } from 'class-validator';
import { CreateChapter } from '@/modules/chapter/dto/create-chapter';

export class EditChapter extends CreateChapter{
  @Allow()
  private id?: string
}
