import { forwardRef, Module } from '@nestjs/common';
import { FollowAuthorService } from './follow-author.service';
import { FollowAuthorController } from './follow-author.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FollowAuthorSchema } from '@/modules/follow-author/follow-author.schema';
import { NotificationModule } from '@/modules/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'FollowAuthor',
        schema: FollowAuthorSchema,
        collection: 'follow_authors',
      },
    ]),
    forwardRef(() => NotificationModule),
  ],
  providers: [FollowAuthorService],
  controllers: [FollowAuthorController],
  exports: [FollowAuthorService],
})
export class FollowAuthorModule {}
