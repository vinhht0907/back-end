import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomLogger } from '@/common/logger/custom-logger';
import { Category } from '@/modules/category/category.interface';
import { extractIdAndSlug } from '@/common/utils/stringProcess';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel('Category') private categoryModel: Model<Category>,
    private logService: CustomLogger,
  ) {
  }

  async checkExist(name: string, id = null) {
    try {
      let filter = { name: name };

      if (id) {
        // @ts-ignore
        filter = { ...filter, _id: { $ne: id } };
      }

      const count = await this.categoryModel.findOne(filter);
      return count !== null;
    } catch (e) {
      this.logService.error({
        name: 'CategoryService/checkExist',
        e,
      });
    }

    return false;
  }

  async create(obj) {
    try {
      const order = await this.categoryModel.find().sort('-order').limit(1);
      if (order && order.length > 0) {
        obj.order = order[0].order + 1;
      } else {
        obj.order = 1;
      }
      return await this.categoryModel.create(obj);
    } catch (e) {
      this.logService.error({
        name: 'CategoryService/create',
        e,
      });

      throw new InternalServerErrorException();
    }
  }

  async update(id, obj) {
    try {
      const category = await this.categoryModel.findById(id);

      if (category) {
        await this.categoryModel.updateOne({
          _id: id,
        }, obj);

        return true;
      }
    } catch (e) {
      this.logService.error({
        name: 'CategoryService/update',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false;
  }

  async delete(id) {
    try {
      const category = await this.categoryModel.findById(id);

      if (category) {
        await this.categoryModel.deleteOne({
          _id: id,
        });
      }
    } catch (e) {
      this.logService.error({
        name: 'CategoryService/delete',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false;
  }

  async listing(
    isCounting = false,
    keyword = null,
    parentType = null,
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

      if (parentType){
        filter['parent_type'] = parentType
      }

      if (isCounting) {
        return await this.categoryModel.countDocuments(filter);
      }

      const sortObj = {};
      sortObj[sortBy] = sortType;

      if (length === -1) {
        return await this.categoryModel.find(filter).sort(sortObj);
      }
      return await this.categoryModel
        .find(filter)
        .sort(sortObj)
        .limit(length)
        .skip(start);
    } catch (e) {
      this.logService.error({
        name: 'CategoryService/listing',
        e,
      });
    }

    if (isCounting) {
      return 0;
    }
    return [];
  }

  async getBySlugAndId(slugAndId) {
    try {
      const extract = extractIdAndSlug(slugAndId)

      const cat = await this.categoryModel.findOne({
        slug: extract.slug,
        _id: extract.id,
      })

      return cat;
    } catch (e) {
      console.log(e);
    }

    return null;
  }
}
