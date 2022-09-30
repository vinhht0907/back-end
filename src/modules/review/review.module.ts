import { forwardRef, Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewSchema } from '@/modules/review/review.schema';
import { ReviewVoteSchema } from '@/modules/review/review-vote.schema';
import { PostModule } from '@/modules/post/post.module';
import { NotificationModule } from '@/modules/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Review', schema: ReviewSchema, collection: 'reviews' },
      {
        name: 'ReviewVote',
        schema: ReviewVoteSchema,
        collection: 'review_votes',
      },
    ]),
    forwardRef(() => PostModule),
    forwardRef(() => NotificationModule),
  ],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
