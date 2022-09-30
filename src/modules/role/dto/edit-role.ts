import { Allow } from 'class-validator';
import { CreateRole } from '@/modules/role/dto/create-role';

export class EditRole extends CreateRole{
  @Allow()
  private id?: string
}
