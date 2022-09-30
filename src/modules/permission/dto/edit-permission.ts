import { Allow } from 'class-validator';
import { CreatePermission } from '@/modules/permission/dto/create-permission';

export class EditPermission extends CreatePermission{
  @Allow()
  private id?: string
}
