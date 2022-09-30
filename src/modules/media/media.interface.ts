import { Document } from 'mongoose';
import { User } from '@/modules/users/interfaces/user.interface';

export interface Media extends Document {
  name: string;
  hash: string;
  ext: string;
  size: number;
  width: number;
  height: number;
  url: string;
  format: object;
  webp: object;
  created_by: string | User;
  updated_by: string | User;
}
