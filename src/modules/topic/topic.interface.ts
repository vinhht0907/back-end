import { Document, Types } from 'mongoose';

export interface TopicInterface extends Document {
    name: string,
    link: string,
    description: string,
    resources: any,
    keywords: any
}
