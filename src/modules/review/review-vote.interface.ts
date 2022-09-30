import { Document } from 'mongoose';
import { User } from '@/modules/users/interfaces/user.interface';
import { Post } from '@/modules/post/post.interface';
import { Review } from '@/modules/review/review.interface';

export interface ReviewVote extends Document {
  _id: string;
  review: string | Review,
  user: string | User,
  post: string | Post,
  is_vote: boolean
}
