import { Document } from 'mongoose';

export interface Notification extends Document {
  user: string;
  type: string;
  data: object;
  read_at: Date;
}
