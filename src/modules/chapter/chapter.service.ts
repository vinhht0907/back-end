import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomLogger } from '@/common/logger/custom-logger';
import { extractIdAndSlug, generateSlug } from '@/common/utils/stringProcess';
import { Chapter } from '@/modules/chapter/chapter.interface';
import { PostService } from '@/modules/post/post.service';
import { PostViewService } from '@/modules/post-view/post-view.service';
import { FollowAuthorService } from '@/modules/follow-author/follow-author.service';
import { UsersService } from '@/modules/users/users.service';
import { BookmarkService } from '@/modules/bookmark/bookmark.service';
import { AUTHOR_POST_NEW_CHAPTER } from '@/modules/notification/notification-types';
import { NotificationService } from '@/modules/notification/notification.service';

@Injectable()
export class ChapterService {
  constructor(
    @InjectModel('Chapter') private chapterModel: Model<Chapter>,
    private logService: CustomLogger,
    @Inject(forwardRef(() => PostService))
    private postService: PostService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => PostViewService))
    private postViewService: PostViewService,
    @Inject(forwardRef(() => FollowAuthorService))
    private followAuthorService: FollowAuthorService,
    @Inject(forwardRef(() => BookmarkService))
    private bookmarkService: BookmarkService,
    @Inject(forwardRef(() => NotificationService))
    private notificationService: NotificationService,
  ) {}

  async create(user, obj) {
    const post = await this.postService.getDetail(obj.post);

    // @ts-ignore
    if (post.author.equals(user._id)) {
      const { ...createObj } = obj;

      const order = await this.chapterModel
        .findOne({
          post: post._id,
        })
        .sort('-order');

      if (order) {
        createObj.order = (order.order || 0) + 1;
      } else {
        createObj.order = 1;
      }

      createObj.slug = generateSlug(obj.title);
      createObj.author = user._id;

      const result = await this.chapterModel.create(createObj);

      if (result) {
        await this.updateActiveChapterCount(post._id);

        if (obj.status) {
          const followers = await this.followAuthorService.getFollowers(
            user._id,
          );

          const notifications = followers.map(item => {
            return {
              type: AUTHOR_POST_NEW_CHAPTER,
              user: item.user,
              data: {
                author: user,
                chapter: {
                  _id: result._id,
                  slug: result.slug,
                  title: result.title,
                },
                post: { _id: post._id, title: post.title, slug: post.slug },
              },
            };
          });

          await this.notificationService.addNotifications(notifications);
        }
      }

      return result;
    } else {
      throw new NotFoundException({ message: 'Not permission in this post!' });
    }
  }

  async updateActiveChapterCount(postId) {
    try {
      const post = await this.postService.findById(postId);

      if (post) {
        const activeChapterCount = await this.chapterModel.countDocuments({
          post: postId,
          status: true,
        });

        post.active_chapter_count = activeChapterCount;
        await post.save();
      }
    } catch (e) {
      console.log(e);
    }
  }

  async update(id, obj, user) {
    try {
      const chapter = await this.chapterModel.findOne({
        _id: id,
        author: user._id,
      });

      obj.slug = generateSlug(obj.title);

      if (chapter) {
        await this.chapterModel.updateOne(
          {
            _id: id,
          },
          obj,
        );

        await this.updateActiveChapterCount(chapter.post);

        return true;
      }
    } catch (e) {
      this.logService.error({
        name: 'ChapterService/update',
        e,
      });

      console.log(e);

      throw new InternalServerErrorException();
    }

    return false;
  }

  async delete(user, id) {
    try {
      const chapter = await this.chapterModel.findOne({
        _id: id,
        author: user._id,
      });

      if (chapter) {
        await this.chapterModel.deleteOne({
          _id: id,
        });

        await this.updateActiveChapterCount(chapter.post);
      }
    } catch (e) {
      this.logService.error({
        name: 'ChapterService/delete',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false;
  }

  async getDetail(id) {
    try {
      const chapter = await this.chapterModel.findById(id);

      return chapter;
    } catch (e) {
      console.log(e);
    }
    return null;
  }

  async getByPost(postId) {
    try {
      const result = await this.chapterModel
        .find({
          post: postId,
        })
        .sort({ order: 'asc' })
        .select('_id title slug order');

      return result;
    } catch (e) {
      console.log(e);
    }

    return [];
  }

  async getBySlugAndId(request, user, slugAndId) {
    try {
      const extract = extractIdAndSlug(slugAndId);

      const chapter = await this.chapterModel
        .findOne({
          slug: extract.slug,
          _id: extract.id,
        })
        .populate({
          path: 'author',
          select: '_id name full_name email avatar',
        })
        .populate({
          path: 'post',
          select: '_id title slug',
          populate: {
            path: 'active_chapters',
            select: '_id title slug order',
          },
        });

      if (chapter) {
        const result = chapter.toObject();

        if (user) {
          const isFollowAuthor = await this.followAuthorService.checkFollow(
            user,
            // @ts-ignore
            chapter.author._id,
          );

          if (isFollowAuthor) {
            // @ts-ignore
            result.is_follow_author = true;
          }

          const isBookmark = await this.bookmarkService.checkBookmark(
            user._id,
            // @ts-ignore
            chapter.post._id,
            chapter._id,
          );

          if (isBookmark) {
            result.is_bookmark = true;
          }
        }

        await this.postViewService.checkToAddView(
          request,
          user,
          // @ts-ignore
          chapter.post._id,
          chapter._id,
        );

        return result;
      }
    } catch (e) {
      console.log(e);
    }

    return null;
  }

  async increaseViewCount(request, user, chapterId) {
    try {
      const chapter = await this.chapterModel.findById(chapterId);

      console.log('increaseViewCount', chapter);

      if (chapter) {
        const result = await this.postViewService.addView(
          request,
          user,
          chapter.post,
          chapter._id,
          chapter.author,
        );

        console.log('increaseViewCount result', result);

        if (result) {
          await this.chapterModel.updateOne(
            { _id: chapter._id },
            {
              $inc: { view_count: 1 },
            },
            {
              timestamps: false,
            },
          );

          await this.postService.increaseViewCount(chapter.post);
          await this.usersService.increaseViewCount(chapter.author);

          return true;
        }
      }
    } catch (e) {
      console.log('increaseViewCount error', e);
    }

    return false;
  }

  async updateCommentInfo(chapterId, commentCount) {
    try {
      const chapter = await this.chapterModel.findById(chapterId);

      if (chapter) {
        await this.chapterModel.updateOne(
          { _id: chapterId },
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

  async updateBookmarkInfo(chapterId, bookmarkCount) {
    try {
      const chapter = await this.chapterModel.findById(chapterId);

      if (chapter) {
        await this.chapterModel.updateOne(
          { _id: chapterId },
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

  async changeOrder(currentUser, postId, arrayId) {
    try {
      const post = await this.postService.findById(postId);

      // @ts-ignore
      if (post.author.equals(currentUser._id)) {
        for (const item of arrayId) {
          const index = arrayId.indexOf(item);
          await this.chapterModel.updateOne(
            {
              _id: item,
              post: postId,
            },
            {
              order: index + 1,
            },
            {
              timestamps: false,
            },
          );
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
}
