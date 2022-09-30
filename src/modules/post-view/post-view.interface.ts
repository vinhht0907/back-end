import { Document } from 'mongoose';
import { Post } from '@/modules/post/post.interface';
import { Chapter } from '@/modules/chapter/chapter.interface';
import { User } from '@/modules/users/interfaces/user.interface';

export interface PostView extends Document {
  post: string | Post,
  author: string | User,
  chapter: string | Chapter,
  user: string | User,
  code: string,
  ip: string,
  user_agent: string,
  status: boolean,
}
