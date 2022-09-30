import { Document } from 'mongoose';

export interface KeywordInterface extends Document {
    name: string,
    topics: any
}
