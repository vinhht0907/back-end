import { forwardRef, Module } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { BookmarkController } from './bookmark.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BookmarkSchema } from '@/modules/bookmark/bookmark.schema';
import { PostModule } from '@/modules/post/post.module';
import { ChapterModule } from '@/modules/chapter/chapter.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Bookmark', schema: BookmarkSchema, collection: 'bookmarks' },
    ]),
    forwardRef(() => PostModule),
    forwardRef(() => ChapterModule),
  ],
  providers: [BookmarkService],
  controllers: [BookmarkController],
  exports: [BookmarkService]
})
export class BookmarkModule {}
