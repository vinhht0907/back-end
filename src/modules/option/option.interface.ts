import { Document } from 'mongoose';

export interface Option extends Document {
  key: string,
  value: any,
}
