import { Document } from 'mongoose';

export interface Page extends Document {
  title: string,
  slug: string,
  content: string,
  seo: string,
}
