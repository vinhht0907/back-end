import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomLogger } from '@/common/logger/custom-logger';
import { Page } from '@/modules/page/page.interface';

@Injectable()
export class PageService {
  constructor(
    @InjectModel('Page') private pageModel: Model<Page>,
    private logService: CustomLogger,
  ) {}

  async checkExist(slug: string, id = null) {
    try {
      let filter = { slug: slug };

      if (id) {
        // @ts-ignore
        filter = { ...filter, _id: { $ne: id } };
      }

      const count = await this.pageModel.findOne(filter);
      return count !== null;
    } catch (e) {
      this.logService.error({
        name: 'PageService/checkExist',
        e,
      });
    }

    return false;
  }

  async getBySlug(slug) {
    try {
      const page = await this.pageModel.findOne({
        slug,
      });

      return page;
    } catch (e) {
      console.log(e);
    }

    return null;
  }

  async create(obj) {
    try {
      return await this.pageModel.create(obj);
    } catch (e) {
      this.logService.error({
        name: 'PageService/create',
        e,
      });

      throw new InternalServerErrorException();
    }
  }

  async update(id, obj) {
    try {
      const category = await this.pageModel.findById(id);

      if (category) {
        await this.pageModel.updateOne(
          {
            _id: id,
          },
          obj,
        );

        return true;
      }
    } catch (e) {
      this.logService.error({
        name: 'PageService/update',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false;
  }

  async delete(id) {
    try {
      const category = await this.pageModel.findById(id);

      if (category) {
        await this.pageModel.deleteOne({
          _id: id,
        });
      }
    } catch (e) {
      this.logService.error({
        name: 'PageService/delete',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false;
  }

  async listing(
    isCounting = false,
    keyword = null,
    start = 0,
    length = 10,
    sortBy = 'order',
    sortType = 'asc',
  ) {
    try {
      let filter = {};
      if (keyword) {
        filter = {
          $or: [
            { name: { $regex: `.*${keyword}.*` } },
            { slug: { $regex: `.*${keyword}.*` } },
            { description: { $regex: `.*${keyword}.*` } },
          ],
        };
      }

      if (isCounting) {
        return await this.pageModel.countDocuments(filter);
      }

      const sortObj = {};
      sortObj[sortBy] = sortType;

      if (length === -1) {
        return await this.pageModel.find(filter).sort(sortObj);
      }
      return await this.pageModel
        .find(filter)
        .sort(sortObj)
        .limit(length)
        .skip(start);
    } catch (e) {
      this.logService.error({
        name: 'PageService/listing',
        e,
      });
    }

    if (isCounting) {
      return 0;
    }
    return [];
  }
}
