import { Document } from 'mongoose';
import { User } from '@/modules/users/interfaces/user.interface';

export interface FollowAuthor extends Document {
  user: string | User,
  author: string | User,
}
