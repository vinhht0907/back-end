import { Allow } from 'class-validator';
import { CreateUser } from '@/modules/users/dto/createUser';

export class EditUser extends CreateUser{
  @Allow()
  private id?: string
}
