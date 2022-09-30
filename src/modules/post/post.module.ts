import { forwardRef, Global, Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PostSchema } from '@/modules/post/post.schema';
import { TagModule } from '@/modules/tag/tag.module';
import { ChapterModule } from '@/modules/chapter/chapter.module';
import { PostViewModule } from '@/modules/post-view/post-view.module';
import { BookmarkModule } from '@/modules/bookmark/bookmark.module';
import { ReviewModule } from '@/modules/review/review.module';
import { NotificationModule } from '@/modules/notification/notification.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Post', schema: PostSchema, collection: 'posts' },
    ]),
    forwardRef(() => TagModule),
    forwardRef(() => ChapterModule),
    forwardRef(() => PostViewModule),
    forwardRef(() => BookmarkModule),
    forwardRef(() => ReviewModule),
    forwardRef(() => NotificationModule),
  ],
  providers: [PostService],
  controllers: [PostController],
  exports: [PostService],
})
export class PostModule {}
