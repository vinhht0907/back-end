import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomLogger } from '@/common/logger/custom-logger';
import { Bookmark } from '@/modules/bookmark/bookmark.inteface';
import { PostService } from '@/modules/post/post.service';
import { ChapterService } from '@/modules/chapter/chapter.service';

@Injectable()
export class BookmarkService {
  constructor(
    @InjectModel('Bookmark') private bookmarkModel: Model<Bookmark>,
    @Inject(forwardRef(() => PostService)) private postService: PostService,
    @Inject(forwardRef(() => ChapterService))
    private chapterService: ChapterService,
    private logService: CustomLogger,
  ) {}

  async bookmark(userId, params) {
    try {
      const filter = { user: userId, post: params.post_id };

      const bookmark = await this.bookmarkModel.findOne(filter);

      if (bookmark) {
        bookmark.chapter = params.chapter_id;

        await bookmark.save();
      } else {
        await this.bookmarkModel.create({
          user: userId,
          post: params.post_id,
          chapter: params.chapter_id,
        });
      }

      await this.updateBookmarkInfo(params);

      return true;
    } catch (e) {
      this.logService.error({
        name: 'BookmarkService/bookmark',
        e,
      });

      throw new InternalServerErrorException();
    }
  }

  async removeBookmark(userId, params) {
    try {
      const filter = { user: userId, post: params.post_id };

      const count = await this.bookmarkModel.countDocuments(filter);

      if (count > 0) {
        await this.bookmarkModel.deleteMany(filter);
      }

      await this.updateBookmarkInfo(params);

      return true;
    } catch (e) {
      console.log(e);
    }

    return false;
  }

  async updateBookmarkInfo(params) {
    try {
      const bookmarkCount = await this.bookmarkModel.countDocuments({
        post: params.post_id,
      });
      await this.postService.updateBookmarkInfo(params.post_id, bookmarkCount);

      if (params.chapter_id) {
        const chapterBookmarkCount = await this.bookmarkModel.countDocuments({
          chapter: params.chapter_id,
        });
        await this.chapterService.updateBookmarkInfo(
          params.chapter_id,
          chapterBookmarkCount,
        );
      }
    } catch (e) {
      console.log(e);
    }
  }

  async getMyBookmark(userId, pagingParams) {
    try {
      const filter = {
        user: userId,
      };

      const count = await this.bookmarkModel.countDocuments(filter);

      const bookmarks = await this.bookmarkModel
        .find(filter)
        .sort({
          created_at: 'desc',
        })
        .limit(pagingParams.length)
        .skip(pagingParams.length * pagingParams.page);

      const data = await this.postService.getPopulatePostList(bookmarks);

      return {
        count,
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

  async checkBookmark(userId, postId, chapterId = null) {
    try {
      const filter = { user: userId, post: postId };

      // if (chapterId) {
      //   filter['chapter'] = chapterId;
      // } else {
      //   filter['chapter'] = null;
      // }

      const count = await this.bookmarkModel.countDocuments(filter);

      if (count) {
        return true;
      }
    } catch (e) {
      console.log(e);
    }

    return false;
  }
}
