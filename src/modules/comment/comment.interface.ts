import { Document } from 'mongoose';
import { User } from '@/modules/users/interfaces/user.interface';
import { Post } from '@/modules/post/post.interface';
import { Chapter } from '@/modules/chapter/chapter.interface';

export interface Comment extends Document {
  user: string | User,
  post: string | Post,
  chapter: string | Chapter,
  parent_comment: string | Comment,
  content: string,
}
