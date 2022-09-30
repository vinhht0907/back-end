import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomLogger } from '@/common/logger/custom-logger';
import { FollowAuthor } from '@/modules/follow-author/follow-author.interface';
import { PagingParams } from '@/common/params/PagingParams';
import { NotificationService } from '@/modules/notification/notification.service';
import {
  AUTHOR_POST_NEW_CHAPTER,
  USER_FOLLOW_AUTHOR,
} from '@/modules/notification/notification-types';

@Injectable()
export class FollowAuthorService {
  constructor(
    @InjectModel('FollowAuthor') private followAuthorModel: Model<FollowAuthor>,
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
    private logService: CustomLogger,
  ) {}

  async toggleFollow(user, author) {
    try {
      const count = await this.followAuthorModel.countDocuments({
        user: user._id,
        author: author,
      });

      if (count) {
        await this.followAuthorModel.deleteMany({
          user: user._id,
          author: author,
        });
      } else {
        await this.followAuthorModel.create({
          user: user._id,
          author: author,
        });

        const notifications = [
          {
            type: USER_FOLLOW_AUTHOR,
            user: author,
            data: {
              user: user,
            },
          },
        ];

        await this.notificationService.addNotifications(notifications);
      }

      return true;
    } catch (e) {
      console.log(e);
    }

    return false;
  }

  async checkFollow(user, author) {
    try {
      const count = await this.followAuthorModel.countDocuments({
        user: user._id,
        author: author,
      });

      if (count) {
        return true;
      }
    } catch (e) {
      console.log(e);
    }

    return false;
  }

  async getFollowers(authorId) {
    try {
      const followers = await this.followAuthorModel.find({ author: authorId });

      return followers;
    } catch (e) {
      console.log(e);
    }

    return [];
  }

  async getMyFollow(user, pagingParams: PagingParams) {
    try {
      const filter = { user: user._id };
      const count = await this.followAuthorModel.countDocuments(filter);

      const result = await this.followAuthorModel
        .find(filter)
        .limit(pagingParams.length)
        .skip(pagingParams.length * pagingParams.page)
        .populate(
          'author',
          '-password -password_reset_token -password_reset_expired -time_expired_active -code_active',
        );

      const data = result.map(item => {
        return {
          // @ts-ignore
          ...item.author.toObject(),
          is_follow: true,
        };
      });

      return {
        data,
        count,
      };
    } catch (e) {
      console.log(e);
    }
    return {
      data: [],
      count: 0,
    };
  }
}
