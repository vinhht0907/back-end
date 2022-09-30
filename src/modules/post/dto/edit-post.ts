import { Allow } from 'class-validator';
import { CreatePost } from '@/modules/post/dto/create-post';

export class EditPost extends CreatePost{
  @Allow()
  private id?: string
}
