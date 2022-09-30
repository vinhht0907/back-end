import { Document } from 'mongoose';

export interface Category extends Document {
  name: string,
  slug: string,
  description: string,
  featured_image: string,
  parent_type:string,
  status: boolean,
  seo_keywords: string,
  seo_description: string,
  order: number
}
