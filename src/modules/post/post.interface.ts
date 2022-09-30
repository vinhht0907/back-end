import { Document } from 'mongoose';
import { User } from '@/modules/users/interfaces/user.interface';
import { Category } from '@/modules/category/category.interface';
import { Tag } from '@/modules/tag/tag.interface';

export interface Post extends Document {
  title: string;
  slug: string;
  description: string;
  content: string;
  categories: Array<string | Category>;
  category_type: string;
  audience: string;
  post_status: string;
  publish_status: string;
  status: boolean;
  tags: Array<string | Tag>;
  author: string | User;
  note: string;
  score: number;
  active_chapter_count: number;
  review_count: number;
  view_count: number;
  comment_count: number;
  bookmark_count: number;
  ranking: number;
}
