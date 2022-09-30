import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomLogger } from '@/common/logger/custom-logger';
import { News } from '@/modules/news/news.interface';
import { extractIdAndSlug, generateSlug } from '@/common/utils/stringProcess';
const words = require('lodash/words');

@Injectable()
export class NewsService {
  constructor(
    @InjectModel('News') private newsModel: Model<News>,
    private logService: CustomLogger,
  ) {}

  private timeFormat = 'YYYY-MM-DD HH:mm:ss';

  async create(user, obj) {
    try {
      const { ...createObj } = obj;

      createObj.author = user._id;
      createObj.status = true;
      createObj.slug = generateSlug(obj.title);

      return await this.newsModel.create(createObj);
    } catch (e) {
      this.logService.error({
        name: 'NewsService/create',
        e,
      });

      throw new InternalServerErrorException();
    }
  }

  async findById(id) {
    try {
      return await this.newsModel.findById(id);
    } catch (e) {
      console.log(e);
    }

    return null;
  }

  async update(id, obj) {
    try {
      const news = await this.newsModel.findOne({
        _id: id,
      });

      const { ...updateObj } = obj;

      updateObj.slug = generateSlug(obj.title);

      if (news) {
        await this.newsModel.updateOne(
          {
            _id: id,
          },
          updateObj,
        );

        return true;
      }
    } catch (e) {
      this.logService.error({
        name: 'NewsService/update',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false;
  }

  async delete(id) {
    try {
      const news = await this.newsModel.findOne({
        _id: id,
      });

      if (news) {
        await this.newsModel.deleteOne({
          _id: id,
        });
      }
    } catch (e) {
      this.logService.error({
        name: 'NewsService/delete',
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

      if (isCounting) {
        return await this.newsModel.countDocuments(filter);
      }

      const sortObj = {};
      sortObj[sortBy] = sortType;

      if (length === -1) {
        return await this.newsModel.find(filter).sort(sortObj);
      }
      return await this.newsModel
        .find(filter)
        .populate('featured_image')
        .sort(sortObj)
        .limit(length)
        .skip(start);
    } catch (e) {
      this.logService.error({
        name: 'NewsService/listing',
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
      const news = await this.newsModel.findById(id);

      return news;
    } catch (e) {
      console.log(e);
    }
    return null;
  }

  async getByCategory(params) {
    try {
      const filter = { category_type: params.category };

      const count = await this.newsModel.countDocuments(filter);

      const data = await this.newsModel
        .find(filter)
        .populate('featured_image')
        .populate('author', '_id full_name')
        .sort({ updated_at: 'desc' })
        .limit(params.length)
        .skip(params.page * params.length);

      const result = data.map(item => {
        const { content, ...info } = item.toObject();

        return {
          ...info,
          time_to_read: (words(content).length + 212) / 213,
        };
      });

      return {
        count,
        data: result,
      };
    } catch (e) {
      console.log(e);
    }

    return {
      data: [],
      count: 0,
    };
  }

  async getBySlugAndId(slugAndId) {
    try {
      const extract = extractIdAndSlug(slugAndId);

      const news = await this.newsModel
        .findOne({
          slug: extract.slug,
          _id: extract.id,
        })
        .populate('featured_image')
        .populate({
          path: 'author',
          select: '_id name full_name email avatar google facebook',
        });

      return news.toObject();
    } catch (e) {
      console.log(e);
    }

    return null;
  }

  async changeStatus(params) {
    try {
      const news = await this.newsModel.findById(params._id);
      if (news) {
        news.status = params.status;

        return await news.save();
      }
    } catch (e) {
      console.log(e);
    }
    return null;
  }
}
