import { Document } from 'mongoose';

export interface Newsletter extends Document {
  email: string,
}
