import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomLogger } from '@/common/logger/custom-logger';
import { Comment } from '@/modules/comment/comment.interface';
import { PostService } from '@/modules/post/post.service';
import { ChapterService } from '@/modules/chapter/chapter.service';
import { NotificationService } from '@/modules/notification/notification.service';
import { USER_COMMENT_POST } from '@/modules/notification/notification-types';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('Comment') private commentModel: Model<Comment>,
    @Inject(forwardRef(() => PostService)) private postService: PostService,
    @Inject(forwardRef(() => ChapterService))
    private chapterService: ChapterService,
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
    private logService: CustomLogger,
  ) {}

  async create(user, obj) {
    try {
      // @ts-ignore
      const result = await this.commentModel.create({ user: user._id, ...obj });

      if (result) {
        const post = await this.postService.getDetail(obj.post);
        let chapter = null;

        if (obj.chapter) {
          chapter = await this.chapterService.getDetail(obj.chapter);
        }

        await this.notificationService.addNotifications([
          {
            type: USER_COMMENT_POST,
            user: post.author,
            data: {
              comment: result._id,
              user: user,
              chapter: chapter
                ? { _id: chapter._id, slug: chapter.slug, title: chapter.title }
                : null,
              post: { _id: post._id, title: post.title, slug: post.slug },
            },
          },
        ]);

        const resultResponse = await this.commentModel
          .findById(result._id)
          .populate(
            'user',
            '_id name full_name avatar thumb_avatar email facebook google',
          )
          .lean();

        resultResponse['child_comment'] = [];
        resultResponse['child_comment_count'] = 0;
        resultResponse['first_child_comment'] = null;

        const commentCount = await this.commentModel.countDocuments({
          post: obj.post,
        });
        await this.postService.updateCommentInfo(obj.post, commentCount);

        if (obj.chapter) {
          const chapterCommentCount = await this.commentModel.countDocuments({
            chapter: obj.chapter,
          });
          await this.chapterService.updateCommentInfo(
            obj.chapter,
            chapterCommentCount,
          );
        }

        return resultResponse;
      } else {
        return null;
      }
    } catch (e) {
      this.logService.error({
        name: 'CommentService/create',
        e,
      });

      throw new InternalServerErrorException();
    }
  }

  async listing(
    isCounting = false,
    post = null,
    chapter = null,
    start = 0,
    length = 10,
    sortBy = 'created_at',
    sortType = 'desc',
  ) {
    try {
      const filter = { parent_comment: null };

      if (post) {
        filter['post'] = post;

        if (chapter) {
          filter['chapter'] = chapter;
        }
      } else {
        return [];
      }

      if (isCounting) {
        return await this.commentModel.countDocuments(filter);
      }

      const sortObj = {};
      sortObj[sortBy] = sortType;

      let result = [];

      if (length === -1) {
        result = await this.commentModel
          .find(filter)
          .populate(
            'user',
            '_id name full_name avatar thumb_avatar email facebook google',
          )
          .populate({
            path: 'child_comment',
            options: { limit: 10, sort: { created_at: 'desc' } },
            populate: {
              path: 'user',
              select:
                '_id name full_name avatar thumb_avatar email facebook google',
            },
          })
          .populate('child_comment_count')
          .sort(sortObj)
          .lean();
      } else {
        result = await this.commentModel
          .find(filter)
          .populate(
            'user',
            '_id name full_name avatar thumb_avatar email facebook google',
          )
          .populate({
            path: 'child_comment',
            options: { limit: 10, sort: { created_at: 'desc' } },
            populate: {
              path: 'user',
              select:
                '_id name full_name avatar thumb_avatar email facebook google',
            },
          })
          .populate('child_comment_count')
          .sort(sortObj)
          .limit(length)
          .skip(start)
          .lean();
      }

      for (let i = 0; i < result.length; i++) {
        if (result[i].child_comment.length > 0) {
          result[i]['first_child_comment'] = result[i]['child_comment'][0];
        } else {
          result[i]['first_child_comment'] = null;
        }
      }
      return result;
    } catch (e) {
      this.logService.error({
        name: 'CommentService/listing',
        e,
      });
    }

    if (isCounting) {
      return 0;
    }
    return [];
  }

  async listingChild(
    isCounting = false,
    post = null,
    parent_comment: null,
    start = 0,
    length = 10,
    sortBy = 'created_at',
    sortType = 'desc',
  ) {
    try {
      const filter = {};

      if (post) {
        filter['post'] = post;
      } else {
        return [];
      }

      if (parent_comment) {
        filter['parent_comment'] = parent_comment;
      } else {
        return [];
      }

      if (isCounting) {
        return await this.commentModel.countDocuments(filter);
      }

      const sortObj = {};
      sortObj[sortBy] = sortType;

      let result = [];

      if (length === -1) {
        result = await this.commentModel
          .find(filter)
          .populate(
            'user',
            '_id name full_name avatar thumb_avatar email facebook google',
          )
          .populate({
            path: 'child_comment',
            options: { limit: 10, sort: { created_at: 'desc' } },
            populate: {
              path: 'user',
              select:
                '_id name full_name avatar thumb_avatar email facebook google',
            },
          })
          .populate('child_comment_count')
          .sort(sortObj)
          .lean();
      } else {
        result = await this.commentModel
          .find(filter)
          .populate(
            'user',
            '_id name full_name avatar thumb_avatar email facebook google',
          )
          .populate({
            path: 'child_comment',
            options: { limit: 10, sort: { created_at: 'desc' } },
            populate: {
              path: 'user',
              select:
                '_id name full_name avatar thumb_avatar email facebook google',
            },
          })
          .populate('child_comment_count')
          .sort(sortObj)
          .limit(length)
          .skip(start + 1)
          .lean();
      }

      for (let i = 0; i < result.length; i++) {
        if (result[i].child_comment.length > 0) {
          result[i]['first_child_comment'] = result[i]['child_comment'][0];
        } else {
          result[i]['first_child_comment'] = null;
        }
      }
      return result;
    } catch (e) {
      this.logService.error({
        name: 'CommentService/listing',
        e,
      });
    }

    if (isCounting) {
      return 0;
    }
    return [];
  }
}
