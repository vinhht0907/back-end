import { Document } from 'mongoose';
import { Post } from '@/modules/post/post.interface';
import { User } from '@/modules/users/interfaces/user.interface';

export interface PostViewDaily extends Document {
  post: string | Post;
  author: string | User;
  view_count: number;
  created_at: string | Date;
  status: boolean;
}
