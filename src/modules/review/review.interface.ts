import { Document } from 'mongoose';
import { User } from '@/modules/users/interfaces/user.interface';
import { Post } from '@/modules/post/post.interface';

export interface Review extends Document {
  _id: string;
  user: string | User;
  post: string | Post;
  content: string;
  star: number;
  vote: number;
  review: any;
}
