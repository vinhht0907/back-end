import { forwardRef, Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentSchema } from '@/modules/comment/comment.schema';
import { PostModule } from '@/modules/post/post.module';
import { ChapterModule } from '@/modules/chapter/chapter.module';
import { NotificationModule } from '@/modules/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Comment', schema: CommentSchema, collection: 'comments' },
    ]),
    forwardRef(() => PostModule),
    forwardRef(() => ChapterModule),
    forwardRef(() => NotificationModule),
  ],
  providers: [CommentService],
  controllers: [CommentController],
  exports: [CommentService],
})
export class CommentModule {}
