import { Document } from 'mongoose';

export interface ResourceInterface extends Document {
    name: string,
    link: string,
    logo: string,
    username: string,
    password: string,
    topics: any
}
