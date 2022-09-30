import { Document } from 'mongoose';

export interface QueueTask extends Document {
  queue_name: string;
  name: string;
  status: string;
  id: string;
  data: any;
  error: any;
  ip: string;
}
