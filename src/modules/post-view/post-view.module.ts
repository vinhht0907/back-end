import { Module } from '@nestjs/common';
import { PostViewService } from './post-view.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PostViewSchema } from '@/modules/post-view/post-view.schema';
import { PostViewDailySchema } from '@/modules/post-view/post-view-daily.schema';
import { PostViewMonthlySchema } from '@/modules/post-view/post-view-monthly.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PostView', schema: PostViewSchema, collection: 'post_views' },
      { name: 'PostViewDaily', schema: PostViewDailySchema, collection: 'post_view_daily' },
      { name: 'PostViewMonthly', schema: PostViewMonthlySchema, collection: 'post_view_monthly' },
    ]),
  ],
  providers: [PostViewService],
  exports: [PostViewService]
})
export class PostViewModule {}
