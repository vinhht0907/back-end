import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomLogger } from '@/common/logger/custom-logger';
import { Review } from '@/modules/review/review.interface';
import { ReviewVote } from '@/modules/review/review-vote.interface';
import * as mongoose from 'mongoose';
import { PostService } from '@/modules/post/post.service';
import { OptionService } from '@/modules/option/option.service';
import { NotificationService } from '@/modules/notification/notification.service';
import { USER_REVIEW_POST } from '@/modules/notification/notification-types';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel('Review') private reviewModel: Model<Review>,
    @InjectModel('ReviewVote') private reviewVoteModel: Model<ReviewVote>,
    @Inject(forwardRef(() => PostService)) private postService: PostService,
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
    @Inject(forwardRef(() => OptionService))
    private optionService: OptionService,
    private logService: CustomLogger,
  ) {}

  async checkExist(userId, postId) {
    try {
      const exist = await this.reviewModel.countDocuments({
        user: userId,
        post: postId,
      });

      return exist > 0;
    } catch (e) {
      console.log(e);
    }

    return false;
  }

  async create(user, obj) {
    try {
      const exist = await this.reviewModel.countDocuments({
        user: user._id,
        post: obj.post,
      });

      if (exist) {
        return false;
      } else {
        const result = await this.reviewModel.create({
          user: user._id,
          ...obj,
        });

        const post = await this.postService.getDetail(obj.post);

        await this.notificationService.addNotifications([
          {
            type: USER_REVIEW_POST,
            user: post.author,
            data: {
              review: result._id,
              user: user,
              post: { _id: post._id, title: post.title, slug: post.slug },
            },
          },
        ]);

        const sumQuery = await this.reviewModel.aggregate([
          {
            $match: { post: mongoose.Types.ObjectId(obj.post) },
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$score' },
              count: { $sum: 1 },
            },
          },
        ]);

        let total = 0,
          count = 0;

        if (sumQuery.length > 0) {
          total = sumQuery[0].total;
          count = sumQuery[0].count;

          if (count > 0) {
            const score = total / count;
            await this.postService.updateReviewInfo(obj.post, count, score);
          }
        }

        return result;
      }
    } catch (e) {
      this.logService.error({
        name: 'ReviewService/create',
        e,
      });

      throw new InternalServerErrorException();
    }
  }

  async listing(
    isCounting = false,
    keyword = null,
    post = null,
    user = null,
    start = 0,
    length = 10,
    sortBy = 'vote',
    sortType = 'desc',
  ) {
    try {
      let filter = {};

      if (keyword) {
        filter = {
          $or: [{ content: { $regex: `.*${keyword}.*` } }],
        };
      }

      if (post) {
        filter['post'] = post;
      }

      if (isCounting) {
        return await this.reviewModel.countDocuments(filter);
      }

      const sortObj = {};
      if (sortBy != 'created_at') {
        sortObj[sortBy] = sortType;
      } else {
        sortObj['created_at'] = sortType;
      }

      if (length === -1) {
        if (user) {
          return await this.reviewModel
            .find(filter)
            .populate({
              path: 'review',
              match: { user: user },
            })
            .populate(
              'user',
              '_id name full_name avatar thumb_avatar email facebook google',
            )
            .sort(sortObj)
            .lean();
        } else {
          return await this.reviewModel
            .find(filter)
            .populate(
              'user',
              '_id name full_name avatar thumb_avatar email facebook google',
            )
            .sort(sortObj)
            .lean();
        }
      }
      if (user) {
        return await this.reviewModel
          .find(filter)
          .populate({
            path: 'review',
            match: { user: user },
          })
          .populate(
            'user',
            '_id name full_name avatar thumb_avatar email facebook google',
          )

          .sort(sortObj)
          .limit(length)
          .skip(start)
          .lean();
      } else {
        return await this.reviewModel
          .find(filter)
          .populate(
            'user',
            '_id name full_name avatar thumb_avatar email facebook google',
          )

          .sort(sortObj)
          .limit(length)
          .skip(start)
          .lean();
      }
    } catch (e) {
      this.logService.error({
        name: 'ReviewService/listing',
        e,
      });
    }

    if (isCounting) {
      return 0;
    }
    return [];
  }

  async vote(user, obj) {
    try {
      let vote = await this.reviewVoteModel.findOne({
        user: user,
        review: obj.review,
      });
      if (vote) {
        const review = await this.reviewModel.findOne({ _id: obj.review });
        if (review) {
          if (obj.is_vote != vote.is_vote && obj.is_vote) {
            review.vote += 2;
          } else if (obj.is_vote != vote.is_vote && !obj.is_vote) {
            review.vote -= 2;
          }
          await review.save();
        }
        vote.is_vote = obj.is_vote;
        await vote.save();
      } else {
        vote = await this.reviewVoteModel.create({ user, ...obj });
        const review = await this.reviewModel.findOne({ _id: obj.review });
        if (review) {
          if (obj.is_vote) {
            review.vote++;
          } else {
            review.vote--;
          }
          await review.save();
        }
      }

      return vote;
    } catch (e) {
      this.logService.error({
        name: 'ReviewService/vote',
        e,
      });

      throw new InternalServerErrorException();
    }
  }
}
