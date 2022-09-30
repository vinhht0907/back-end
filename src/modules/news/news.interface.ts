import { Document } from 'mongoose';
import { User } from '@/modules/users/interfaces/user.interface';
import { Media } from '@/modules/media/media.interface';

export interface News extends Document {
  title: string;
  slug: string;
  description: string;
  content: string;
  category_type: string;
  seo_keyword: string;
  status: boolean;
  author: string | User;
  featured_image: string | Media;
  tags: string;
}
