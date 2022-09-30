import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomLogger } from '@/common/logger/custom-logger';
import { Post } from '@/modules/post/post.interface';
import { extractIdAndSlug, generateSlug } from '@/common/utils/stringProcess';
import { TagService } from '@/modules/tag/tag.service';
import { ChapterService } from '@/modules/chapter/chapter.service';
import { Search } from '@/modules/post/dto/search';
import { PagingParams } from '@/common/params/PagingParams';
import {
  POST_STATUS_PUBLISHED,
  POST_STATUS_UNPUBLISHED,
} from '@/common/constants/postStatus';
import { PostViewService } from '@/modules/post-view/post-view.service';
import { OptionService } from '@/modules/option/option.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookmarkService } from '@/modules/bookmark/bookmark.service';
import { ReviewService } from '@/modules/review/review.service';
import { NotificationService } from '@/modules/notification/notification.service';
import {
  ADMIN_DISABLED_POST,
  AUTHOR_POST_NEW_CHAPTER,
} from '@/modules/notification/notification-types';

const moment = require('moment');
const range = require('lodash/range');
const sampleSize = require('lodash/sampleSize');

@Injectable()
export class PostService {
  constructor(
    @InjectModel('Post') private postModel: Model<Post>,
    private logService: CustomLogger,
    private tagService: TagService,
    @Inject(forwardRef(() => ChapterService))
    private chapterService: ChapterService,
    @Inject(forwardRef(() => PostViewService))
    private postViewService: PostViewService,
    @Inject(forwardRef(() => OptionService))
    private optionService: OptionService,
    @Inject(forwardRef(() => BookmarkService))
    private bookmarkService: BookmarkService,
    @Inject(forwardRef(() => ReviewService))
    private reviewService: ReviewService,
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
  ) {}

  private timeFormat = 'YYYY-MM-DD HH:mm:ss';

  async create(user, obj) {
    try {
      const { tags, ...createObj } = obj;

      createObj.author = user._id;
      createObj.status = true;
      createObj.slug = generateSlug(obj.title);

      const existTags = tags.filter(item => item.value).map(item => item.value);
      const newTags = tags.filter(item => typeof item === 'string');

      for (const tag of newTags) {
        const result = await this.tagService.create({ name: tag }, true);

        if (result) {
          existTags.push(result._id);
        }
      }

      createObj.tags = existTags;

      return await this.postModel.create(createObj);
    } catch (e) {
      console.log(e);
      this.logService.error({
        name: 'PostService/create',
        e,
      });

      throw new InternalServerErrorException();
    }
  }

  async findById(id) {
    try {
      return await this.postModel.findById(id);
    } catch (e) {
      console.log(e);
    }

    return null;
  }

  async update(id, obj, user) {
    try {
      const post = await this.postModel.findOne({
        _id: id,
        author: user._id,
      });

      const { tags, ...updateObj } = obj;

      updateObj.slug = generateSlug(obj.title);

      const existTags = tags.filter(item => item.value).map(item => item.value);
      const newTags = tags.filter(item => typeof item === 'string');

      for (const tag of newTags) {
        const result = await this.tagService.create({ name: tag }, true);

        if (result) {
          existTags.push(result._id);
        }
      }

      updateObj.tags = existTags;

      if (post) {
        await this.postModel.updateOne(
          {
            _id: id,
          },
          updateObj,
          {
            timestamps: false,
          },
        );

        return true;
      }
    } catch (e) {
      this.logService.error({
        name: 'PostService/update',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false;
  }

  async delete(user, id) {
    try {
      const post = await this.postModel.findOne({
        _id: id,
        author: user._id,
      });

      if (post) {
        await this.postModel.deleteOne({
          _id: id,
        });
      }
    } catch (e) {
      this.logService.error({
        name: 'PostService/delete',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false;
  }

  async listing(
    isCounting = false,
    keyword = null,
    filterParams = null,
    start = 0,
    length = 10,
    sortBy = 'title',
    sortType = 'asc',
  ) {
    try {
      let filter = {};
      if (keyword) {
        filter = {
          $or: [{ title: { $regex: keyword, $options: 'i' } }],
        };
      }

      if (filterParams && filterParams.title) {
        filter['title'] = { $regex: filterParams.title, $options: 'i' };
      }
      if (filterParams && filterParams.description) {
        filter['description'] = { $regex: `.*${filterParams.description}.*` };
      }
      if (filterParams && filterParams.category_type) {
        filter['category_type'] = filterParams.category_type;
      }
      if (filterParams && filterParams.categories) {
        filter['categories'] = { $in: filterParams.categories };
      }

      if (isCounting) {
        return await this.postModel.countDocuments(filter);
      }

      const sortObj = {};
      sortObj[sortBy] = sortType;

      if (length === -1) {
        return await this.postModel.find(filter).sort(sortObj);
      }
      return await this.postModel
        .find(filter)
        .sort(sortObj)
        .populate('author', '_id full_name email google facebook')
        .populate('categories')
        .limit(length)
        .skip(start);
    } catch (e) {
      this.logService.error({
        name: 'PostService/listing',
        e,
      });
    }

    if (isCounting) {
      return 0;
    }
    return [];
  }

  async getDetail(id) {
    try {
      const post = await this.postModel.findById(id);

      return post;
    } catch (e) {
      console.log(e);
    }
    return null;
  }

  async getBySlugAndId(slugAndId, currentUser = null) {
    try {
      const extract = extractIdAndSlug(slugAndId);

      const post = await this.postModel
        .findOne({
          slug: extract.slug,
          _id: extract.id,
        })
        .populate({
          path: 'categories',
          select: '_id name slug',
        })
        .populate('tags')
        .populate({
          path: 'active_chapters',
          select: '_id title slug created_at updated_at',
        })
        .populate({
          path: 'author',
          select: '_id name full_name email avatar google facebook',
        });

      const result = post.toObject();

      if (currentUser) {
        const isBookmark = await this.bookmarkService.checkBookmark(
          currentUser._id,
          post._id,
        );

        if (isBookmark) {
          result.is_bookmark = true;
        }

        const isReview = await this.reviewService.checkExist(
          currentUser._id,
          post._id,
        );

        if (isReview) {
          result.is_review = true;
        }
      }

      return result;
    } catch (e) {
      console.log(e);
    }

    return null;
  }

  async changeStatus(params) {
    try {
      const post = await this.postModel.findById(params._id);
      if (post) {
        post.status = params.status;
        post.note = params.note;

        await this.postViewService.updateStatus([params._id], params.status);

        if (params.status === false) {
          const notifications = [
            {
              type: ADMIN_DISABLED_POST,
              user: post.author,
              data: {
                author: post.author,
                post: { _id: post._id, title: post.title, slug: post.slug },
                note: params.note,
              },
            },
          ];

          await this.notificationService.addNotifications(notifications);
        }

        return await post.save();
      }
    } catch (e) {
      console.log(e);
    }
    return null;
  }

  async changePublishStatus(user, id, publish_status) {
    try {
      const post = await this.postModel.findById(id);
      if (post) {
        post.publish_status = publish_status;

        return await post.save();
      }
    } catch (e) {
      console.log(e);
    }
    return null;
  }

  async getReadingList(userId, pagingParams) {
    try {
      const result = await this.postViewService.getReadingByUser(
        userId,
        pagingParams,
      );

      const data = await this.getPopulatePostList(result.data);

      return {
        count: result.count,
        data,
      };
    } catch (e) {
      console.log(e);
    }

    return {
      count: 0,
      data: [],
    };
  }

  async getChapters(postId) {
    return await this.chapterService.getByPost(postId);
  }

  async search(searchParams: Search, user = null) {
    if (searchParams.timeRange && searchParams.timeRange !== 'all') {
      return await this.searchWithTimeRange(searchParams, user);
    } else {
      return await this.searchWithoutTimeRange(searchParams, user);
    }
  }

  async searchWithTimeRange(searchParams: Search, user = null) {
    try {
      let startTime = moment()
        .startOf('day')
        .format(this.timeFormat);
      const endTime = moment()
        .endOf('day')
        .format(this.timeFormat);

      let result = null;

      switch (searchParams.timeRange) {
        case 'week':
          startTime = moment()
            .subtract(6, 'days')
            .startOf('day')
            .format(this.timeFormat);
          break;
        case 'month':
          startTime = moment()
            .subtract(29, 'days')
            .startOf('day')
            .format(this.timeFormat);
          break;
      }

      switch (searchParams.orderBy) {
        case 'vote_count':
          break;
        case 'view_count':
          result = await this.searchByView(
            startTime,
            endTime,
            searchParams.page * searchParams.length,
            searchParams.length,
          );
          break;
      }

      if (result != null && result.data.length > 0) {
        const posts = await this.postModel.populate(result.data, {
          path: 'post',
          populate: [
            {
              path: 'author',
              select: '_id name full_name email avatar google facebook',
            },
            {
              path: 'categories',
              select: '_id name slug',
            },
          ],
        });

        return {
          count: result.count,
          // @ts-ignore
          data: posts.map(item => {
            const obj = { ...item.post.toObject() };
            obj.statistic_view = item.count;

            return obj;
          }),
        };
      }
    } catch (e) {
      console.log(e);
    }

    return { count: 0, data: [] };
  }

  async getPopulatePostList(arr, path = 'post') {
    try {
      const data = await this.postModel.populate(arr, {
        path: path,
        populate: [
          {
            path: 'author',
            select: '_id name full_name email avatar google facebook',
          },
          {
            path: 'categories',
            select: '_id name slug',
          },
        ],
      });

      // @ts-ignore
      const posts = data.map(item => item.post);

      return posts;
    } catch (e) {
      console.log(e);
    }

    return [];
  }

  async searchByView(startTime, endTime, skip, take) {
    try {
      return await this.postViewService.getByTimeRange(
        startTime,
        endTime,
        skip,
        take,
      );
    } catch (e) {
      console.log(e);
    }

    return { count: 0, data: [] };
  }

  async searchWithoutTimeRange(searchParams: Search, user = null) {
    try {
      const filter = {
        status: true,
        publish_status: POST_STATUS_PUBLISHED,
        active_chapter_count: { $gt: 0 },
      };

      const order = {};

      switch (searchParams.orderBy) {
        case 'newest':
          order['updated_at'] = 'desc';
          break;
        case 'vote_count':
          order['ranking'] = 'desc';
          break;
        case 'view_count':
          order['view_count'] = 'desc';
          break;
        default:
          order['updated_at'] = 'desc';
          break;
      }

      if (searchParams.categories && searchParams.categories.length > 0) {
        filter['categories'] = { $in: searchParams.categories };
      }

      const count = await this.postModel.countDocuments(filter);

      const data = await this.postModel
        .find(filter)
        .sort(order)
        .populate('author', '_id full_name email avatar google facebook')
        .populate('categories')
        .limit(searchParams.length)
        .skip(searchParams.length * searchParams.page);

      return { count, data };
    } catch (e) {
      console.log(e);
    }

    return { count: 0, data: [] };
  }

  async advanceSearch(searchParams) {
    try {
      const filter = {
        status: true,
        publish_status: POST_STATUS_PUBLISHED,
        active_chapter_count: { $gt: 0 },
      };

      const order = {};

      switch (searchParams.orderBy) {
        case 'newest':
          order['updated_at'] = 'desc';
          break;
        case 'vote_count':
          order['ranking'] = 'desc';
          break;
        case 'view_count':
          order['view_count'] = 'desc';
          break;
        default:
          order['title'] = 'asc';
          break;
      }

      if (searchParams.category_type) {
        filter['category_type'] = { $in: searchParams.category_type };
      }

      if (searchParams.title) {
        filter['title'] = {
          $regex: searchParams.title,
          $options: 'i',
        };
      }

      if (searchParams.categories && searchParams.categories.length > 0) {
        filter['categories'] = { $in: searchParams.categories };
      }

      if (searchParams.tags && searchParams.tags.length > 0) {
        filter['tags'] = { $in: searchParams.tags };
      }

      if (searchParams.author) {
        filter['author'] = searchParams.author;
      }

      if (searchParams.audience) {
        filter['audience'] = searchParams.audience;
      }

      const count = await this.postModel.countDocuments(filter);

      const data = await this.postModel
        .find(filter)
        .sort(order)
        .populate('author', '_id full_name email avatar google facebook')
        .populate('categories')
        .limit(searchParams.length)
        .skip(searchParams.length * searchParams.page);

      return { count, data };
    } catch (e) {
      console.log(e);
    }

    return {
      count: 0,
      data: [],
    };
  }

  async getMyPost(user, isCounting, params: PagingParams) {
    try {
      const filter = {
        author: user._id,
      };

      if (isCounting) {
        return await this.postModel.countDocuments(filter);
      }

      return await this.postModel
        .find(filter)
        .sort({
          view_count: 'desc',
        })
        .populate('author', '_id full_name email avatar google facebook')
        .populate('categories')
        .limit(params.length)
        .skip(params.length * params.page);
    } catch (e) {
      console.log(e);
    }

    return isCounting ? 0 : [];
  }

  async getAuthorPost(authorId, isCounting, params: PagingParams) {
    try {
      const filter = {
        author: authorId,
        status: true,
      };

      if (isCounting) {
        return await this.postModel.countDocuments(filter);
      }

      return await this.postModel
        .find(filter)
        .sort({
          view_count: 'desc',
        })
        .populate('author', '_id full_name email avatar google facebook')
        .populate('categories')
        .limit(params.length)
        .skip(params.length * params.page);
    } catch (e) {
      console.log(e);
    }

    return isCounting ? 0 : [];
  }

  async increaseViewCount(postId) {
    try {
      await this.postModel.updateOne(
        { _id: postId },
        {
          $inc: { view_count: 1 },
        },
        {
          timestamps: false,
        },
      );
    } catch (e) {
      console.log(e);
    }
  }

  async getRelatedPosts(postId) {
    try {
      const post = await this.postModel.findById(postId);

      if (post) {
        let limit = 9;
        const filter = {
          status: true,
          publish_status: POST_STATUS_PUBLISHED,
          active_chapter_count: { $gt: 0 },
          _id: { $ne: postId },
          categories: { $in: post.categories },
        };

        const total = await this.postModel.countDocuments(filter);
        const ranges = range(total);

        if (total < limit) {
          limit = total;
        }

        const sample = sampleSize(ranges, limit);

        const result = [];

        for await (const index of sample) {
          const obj = await this.postModel
            .find(filter)
            .populate('author', '_id full_name email avatar google facebook')
            .populate('categories')
            .limit(1)
            .skip(index);

          if (obj.length > 0) {
            result.push(obj[0]);
          }
        }

        return result;
      }
    } catch (e) {
      console.log(e);
    }

    return [];
  }

  async updateReviewInfo(postId, reviewCount, reviewScore) {
    try {
      const post = await this.postModel.findById(postId);

      if (post) {
        const option = await this.optionService.getOptionByKey(
          'post_review_info',
        );
        let weightScore = 0;

        if (option) {
          weightScore =
            (reviewCount * reviewScore + 50 * option.value.avg_score) /
            (reviewCount + 50);

          let newTotalPostWithReview = option.value.total_post_having_review,
            newAvgScore = 0;

          if (reviewCount === 1) {
            newTotalPostWithReview += 1;
            newAvgScore =
              (option.value.total_post_having_review * option.value.avg_score +
                reviewScore) /
              newTotalPostWithReview;
          } else {
            newAvgScore =
              (option.value.total_post_having_review * option.value.avg_score -
                post.score +
                reviewScore) /
              newTotalPostWithReview;
          }

          await this.optionService.updateOption('post_review_info', {
            value: {
              avg_score: newAvgScore,
              total_post_having_review: newTotalPostWithReview,
            },
          });
        }

        await this.postModel.updateOne(
          { _id: postId },
          {
            review_count: reviewCount,
            score: reviewScore,
            ranking: weightScore,
          },
          {
            timestamps: false,
          },
        );
      }
    } catch (e) {
      console.log(e);
    }
  }

  async updateCommentInfo(postId, commentCount) {
    try {
      const post = await this.postModel.findById(postId);

      if (post) {
        await this.postModel.updateOne(
          { _id: postId },
          {
            comment_count: commentCount,
          },
          {
            timestamps: false,
          },
        );
      }
    } catch (e) {
      console.log(e);
    }
  }

  async updateBookmarkInfo(postId, bookmarkCount) {
    try {
      const post = await this.postModel.findById(postId);

      if (post) {
        await this.postModel.updateOne(
          { _id: postId },
          {
            bookmark_count: bookmarkCount,
          },
          {
            timestamps: false,
          },
        );
      }
    } catch (e) {
      console.log(e);
    }
  }
}
