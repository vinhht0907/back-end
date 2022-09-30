import { Document } from 'mongoose';

export interface Feedback extends Document {
  name: string,
  email: string,
  content: string,
  status: string
}
