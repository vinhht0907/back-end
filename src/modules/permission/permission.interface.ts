import { Document } from 'mongoose';

export interface Permission extends Document {
  name: string,
  display_name: string,
  description: string,
  roles: Array<any>,
  status: boolean,
}
