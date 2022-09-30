import { Document } from 'mongoose';
import { User } from '@/modules/users/interfaces/user.interface';
import { Post } from '@/modules/post/post.interface';

export interface Chapter extends Document {
  title: string;
  slug: string;
  content: string;
  post: string | Post;
  status: boolean;
  active_chapter_count: number;
  view_count: number;
  comment_count: number;
  bookmark_count: number;
  author: string | User;
  order: number;
}
