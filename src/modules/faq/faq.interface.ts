import { Document } from 'mongoose';

export interface Faq extends Document {
  title: string,
  content: string,
  type: string,
  order: number
}
