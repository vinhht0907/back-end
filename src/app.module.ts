import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenBlacklistMiddleware } from '@/common/middleware/token-blacklist.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CacheModule } from './modules/cache/cache.module';
import { SharedModule } from './modules/shared/shared.module';
import { MediaModule } from './modules/media/media.module';
import { PermissionModule } from './modules/permission/permission.module';
import { RoleModule } from '@/modules/role/role.module';
import { QueueTaskModule } from './modules/queue-task/queue-task.module';
import { CategoryModule } from './modules/category/category.module';
import { EmailModule } from './modules/email/email.module';
import { PostModule } from './modules/post/post.module';
import { TagModule } from './modules/tag/tag.module';
import { FacebookModule } from './modules/facebook/facebook.module';
import { GoogleModule } from '@/modules/google/google.module';
import { PageModule } from '@/modules/page/page.module';
import { FaqModule } from '@/modules/faq/faq.module';
import { FeedbackModule } from '@/modules/feedback/feedback.module';
import { NewsletterModule } from '@/modules/newsletter/newsletter.module';
import { ChapterModule } from './modules/chapter/chapter.module';
import { BookmarkModule } from './modules/bookmark/bookmark.module';
import { ReviewModule } from './modules/review/review.module';
import { PostViewModule } from './modules/post-view/post-view.module';
import { FollowAuthorModule } from './modules/follow-author/follow-author.module';
import { CommentModule } from './modules/comment/comment.module';
import { OptionModule } from './modules/option/option.module';
import { ReactionModule } from './modules/reaction/reaction.module';
import { NotificationModule } from './modules/notification/notification.module';
import { NewsModule } from '@/modules/news/news.module';
import { ResourceModule } from './modules/resource/resource.module';
import { TopicModule } from './modules/topic/topic.module';
import { KeywordModule } from './modules/keyword/keyword.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGO_URI'),
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    CacheModule,
    SharedModule,
    MediaModule,
    PermissionModule,
    RoleModule,
    QueueTaskModule,
    CategoryModule,
    EmailModule,
    PostModule,
    TagModule,
    FacebookModule,
    GoogleModule,
    PageModule,
    FaqModule,
    FeedbackModule,
    NewsletterModule,
    ChapterModule,
    BookmarkModule,
    ReviewModule,
    PostViewModule,
    FollowAuthorModule,
    CommentModule,
    OptionModule,
    ReactionModule,
    NotificationModule,
    NewsModule,
    ResourceModule,
    TopicModule,
    KeywordModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(TokenBlacklistMiddleware)
      .exclude('user/login')
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
