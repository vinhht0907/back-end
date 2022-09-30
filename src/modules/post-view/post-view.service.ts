import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomLogger } from '@/common/logger/custom-logger';
import { PostView } from '@/modules/post-view/post-view.interface';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PostViewDaily } from '@/modules/post-view/post-view-daily.interface';
import { PostViewMonthly } from '@/modules/post-view/post-view-monthly.interface';
import { PostService } from '@/modules/post/post.service';
import { PagingParams } from '@/common/params/PagingParams';

const moment = require('moment');

@Injectable()
export class PostViewService {
  constructor(
    @InjectModel('PostView') private postViewModel: Model<PostView>,
    @InjectModel('PostViewDaily')
    private postViewDailyModel: Model<PostViewDaily>,
    @InjectModel('PostViewMonthly')
    private postViewMonthlyModel: Model<PostViewMonthly>,
    @Inject(forwardRef(() => PostService))
    private postService: PostService,
    private logService: CustomLogger,
  ) {}

  private timeFormat = 'YYYY-MM-DD HH:mm:ss';

  async addView(request, user, post, chapter, author) {
    try {
      if (request.headers['urc']) {
        const view = await this.postViewModel.findOne({
          post: post,
          author: author,
          chapter: chapter,
          code: request.headers['urc'],
          ip: request.ip,
          user_agent: request.headers['user-agent'],
          status: false,
          created_at: {
            $lt: new Date(
              moment()
                .subtract('15', 'seconds')
                .format('YYYY-MM-DD HH:mm:ss'),
            ),
          },
        });

        console.log('addView', view);

        if (view) {
          view.status = true;
          await view.save();

          return true;
        }
      }
    } catch (e) {
      console.log('addView error', e);
    }

    return false;
  }

  async checkToAddView(request, user, post, chapter) {
    try {
      if (request.headers['urc']) {
        const postObj = await this.postService.findById(post);

        if (postObj) {
          const view = await this.postViewModel.findOne({
            post: post,
            chapter: chapter,
            code: request.headers['urc'],
            ip: request.ip,
            user_agent: request.headers['user-agent'],
            status: false,
            created_at: {
              $lt: new Date(
                moment()
                  .subtract('15', 'seconds')
                  .format('YYYY-MM-DD HH:mm:ss'),
              ),
            },
          });

          console.log('exist_view', view);

          if (!view) {
            await this.postViewModel.create({
              user,
              post,
              chapter,
              author: postObj.author,
              code: request.headers['urc'],
              ip: request.ip,
              user_agent: request.headers['user-agent'],
              status: false,
            });

            console.log('check add view');
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async removeUnread() {
    try {
      await this.postViewModel.deleteMany({
        status: { $ne: true },
        created_at: {
          $lt: new Date(
            moment()
              .subtract('1', 'hours')
              .format('YYYY-MM-DD HH:mm:ss'),
          ),
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async statisticDaily() {
    try {
      const startTime = moment()
        .subtract(1, 'days')
        .startOf('day')
        .format(this.timeFormat);

      const endTime = moment()
        .subtract(1, 'days')
        .endOf('day')
        .format(this.timeFormat);

      const cursor = this.postViewModel
        .aggregate([
          {
            $match: {
              created_at: {
                $gte: new Date(startTime),
                $lte: new Date(endTime),
              },
              status: true,
            },
          },
          {
            $group: {
              _id: { id: '$post' },
              post: { $first: '$post' },
              author: { $first: '$author' },
              count: { $sum: 1 },
            },
          },
        ])
        .cursor({})
        .exec();

      await cursor.eachAsync(async doc => {
        const filter = {
          post: doc.post,
          created_at: startTime,
        };

        const post = await this.postService.findById(doc.post);

        const update = {
          post: doc.post,
          author: doc.author,
          view_count: doc.count,
          status: post.status,
          created_at: startTime,
        };

        await this.postViewDailyModel.findOneAndUpdate(filter, update, {
          new: true,
          upsert: true,
          timestamps: false,
        });
      });
    } catch (e) {
      console.log(e);
    }
  }

  @Cron('0 2 1 * *') //EVERY_1ST_DAY_OF_MONTH_AT_2AM
  async statisticMonthly() {
    try {
      const startTime = moment()
        .subtract(1, 'days')
        .startOf('month')
        .format(this.timeFormat);

      const endTime = moment()
        .subtract(1, 'days')
        .endOf('month')
        .format(this.timeFormat);

      const cursor = this.postViewDailyModel
        .aggregate([
          {
            $match: {
              created_at: {
                $gte: new Date(startTime),
                $lte: new Date(endTime),
              },
            },
          },
          {
            $group: {
              _id: { id: '$post' },
              post: { $first: '$post' },
              author: { $first: '$author' },
              count: { $sum: '$view_count' },
            },
          },
        ])
        .cursor({})
        .exec();

      await cursor.eachAsync(async doc => {
        const filter = {
          post: doc.post,
          created_at: startTime,
        };

        const post = await this.postService.findById(doc.post);

        const update = {
          post: doc.post,
          author: doc.author,
          view_count: doc.count,
          status: post.status,
          created_at: startTime,
        };

        await this.postViewMonthlyModel.findOneAndUpdate(filter, update, {
          new: true,
          upsert: true,
          timestamps: false,
        });
      });
    } catch (e) {
      console.log(e);
    }
  }

  async getByTimeRange(startTime, endTime, skip, limit) {
    try {
      const result = await this.postViewDailyModel.aggregate([
        {
          $match: {
            status: true,
            created_at: {
              $gte: new Date(startTime),
              $lte: new Date(endTime),
            },
          },
        },
        {
          $group: {
            _id: { id: '$post' },
            post: { $first: '$post' },
            count: { $sum: '$view_count' },
          },
        },
        { $sort: { count: -1 } },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [{ $skip: skip }, { $limit: limit }],
          },
        },
      ]);

      if (result && result.length > 0) {
        return {
          count:
            result[0].metadata.length > 0 ? result[0].metadata[0].total : 0,
          data: result[0].data,
        };
      }
    } catch (e) {
      console.log(e);
    }

    return {
      count: 0,
      data: [],
    };
  }

  async getTopAuthorByTimeRange(startTime, endTime, skip, limit) {
    try {
      const result = await this.postViewDailyModel.aggregate([
        {
          $match: {
            created_at: {
              $gte: new Date(startTime),
              $lte: new Date(endTime),
            },
          },
        },
        {
          $group: {
            _id: { id: '$author' },
            author: { $first: '$author' },
            post: { $first: '$post' },
            count: { $sum: '$view_count' },
          },
        },
        { $sort: { count: -1 } },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [{ $skip: skip }, { $limit: limit }],
          },
        },
      ]);

      if (result && result.length > 0) {
        return {
          count:
            result[0].metadata.length > 0 ? result[0].metadata[0].total : 0,
          data: result[0].data,
        };
      }
    } catch (e) {
      console.log(e);
    }

    return {
      count: 0,
      data: [],
    };
  }

  async getReadingByUser(userId, pagingParams: PagingParams) {
    try {
      const result = await this.postViewModel.aggregate([
        {
          $match: {
            user: userId,
            status: true,
          },
        },
        {
          $group: {
            _id: { id: '$post' },
            post: { $first: '$post' },
          },
        },
        { $sort: { created_at: -1 } },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: [
              { $skip: pagingParams.page * pagingParams.length },
              { $limit: pagingParams.length },
            ],
          },
        },
      ]);

      if (result && result.length > 0) {
        return {
          count:
            result[0].metadata.length > 0 ? result[0].metadata[0].total : 0,
          data: result[0].data,
        };
      }
    } catch (e) {
      console.log(e);
    }

    return {
      count: 0,
      data: [],
    };
  }

  async updateStatus(arrPost, status) {
    try {
      await this.postViewMonthlyModel.updateMany(
        { post: { $in: arrPost } },
        { status: status },
      );
      await this.postViewDailyModel.updateMany(
        { post: { $in: arrPost } },
        { status: status },
      );
    } catch (e) {
      console.log(e);
    }
  }
}
