import { Allow } from 'class-validator';
import { CreatePage} from '@/modules/page/dto/create-page';

export class EditPage extends CreatePage{
  @Allow()
  private id?: string
}
