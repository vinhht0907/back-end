import { Document } from 'mongoose';

export interface Tag extends Document {
  name: string,
  name_normalized: string,
  status: boolean,
  slug: string
}
