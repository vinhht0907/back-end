import { forwardRef, Module } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { ChapterController } from './chapter.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ChapterSchema } from '@/modules/chapter/chapter.schema';
import { PostModule } from '@/modules/post/post.module';
import { PostViewModule } from '@/modules/post-view/post-view.module';
import { FollowAuthorModule } from '@/modules/follow-author/follow-author.module';
import { BookmarkModule } from '@/modules/bookmark/bookmark.module';
import { NotificationModule } from '@/modules/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Chapter', schema: ChapterSchema, collection: 'chapters' },
    ]),
    forwardRef(() => PostModule),
    forwardRef(() => PostViewModule),
    forwardRef(() => FollowAuthorModule),
    forwardRef(() => BookmarkModule),
    forwardRef(() => NotificationModule),
  ],
  providers: [ChapterService],
  controllers: [ChapterController],
  exports: [ChapterService],
})
export class ChapterModule {}
