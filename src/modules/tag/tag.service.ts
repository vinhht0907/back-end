import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomLogger } from '@/common/logger/custom-logger';
import { Tag } from '@/modules/tag/tag.interface';
import { SearchTag } from '@/modules/tag/dto/search-tag';
import {generateSlug} from '@/common/utils/stringProcess';

@Injectable()
export class TagService {
  constructor(
    @InjectModel('Tag') private tagModel: Model<Tag>,
    private logService: CustomLogger,
  ) {}

  processingTagName(tagName, lowercase = false) {
    return tagName
      .replace(/ +(?= )/g, '')
      .trim()
      .toLowerCase();
  }

  async checkExist(tagName: string, id = null) {
    try {
      let filter = { name_normalized: this.processingTagName(tagName, true) };

      if (id) {
        // @ts-ignore
        filter = { ...filter, _id: { $ne: id } };
      }

      const count = await this.tagModel.findOne(filter);
      return count !== null;
    } catch (e) {
      this.logService.error({
        name: 'TagService/checkExist',
        e,
      });
    }

    return false;
  }

  async create(obj, autoSlug = false) {
    try {
      obj.name = this.processingTagName(obj.name);
      obj.name_normalized = this.processingTagName(obj.name, true);
      if(autoSlug) {
        obj.slug = generateSlug(obj.name)
      }
      obj.status = true;

      return await this.tagModel.create(obj);
    } catch (e) {
      this.logService.error({
        name: 'TagService/create',
        e,
      });

      return null
    }
  }

  async update(id, obj) {
    try {
      const tag = await this.tagModel.findById(id);

      obj.name = this.processingTagName(obj.name);
      obj.name_normalized = this.processingTagName(obj.name, true);
      // obj.slug = generateSlug(obj.name)

      if (tag) {
        await this.tagModel.updateOne(
          {
            _id: id,
          },
          obj,
        );

        return true;
      }
    } catch (e) {
      this.logService.error({
        name: 'TagService/update',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false;
  }

  async delete(id) {
    try {
      const tag = await this.tagModel.findById(id);

      if (tag) {
        await this.tagModel.deleteOne({
          _id: id,
        });
      }
    } catch (e) {
      this.logService.error({
        name: 'TagService/delete',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false;
  }

  async search(searchTag: SearchTag) {
    try {
      let filter = {};
      if (searchTag.name) {
        filter = {
          name: { $regex: `.*${searchTag.name}.*` },
        };
      }

      const tags = await this.tagModel
        .find(filter)
        .select('_id name')
        .sort({ name: 'asc' })
        .limit(searchTag.length)
        .skip(searchTag.page * searchTag.length);

      const total = await this.tagModel.countDocuments(filter);

      return {
        data: tags,
        total: total,
      };
    } catch (e) {
      console.log(e);
    }

    return {
      data: [],
      total: 0,
    };
  }

  async listing(
    isCounting = false,
    keyword = null,
    start = 0,
    length = 10,
    sortBy = 'name',
    sortType = 'asc',
  ) {
    try {
      let filter = {};
      if (keyword) {
        filter = {
          name: { $regex: `.*${keyword}.*` },
        };
      }

      if (isCounting) {
        return await this.tagModel.countDocuments(filter);
      }

      const sortObj = {};
      sortObj[sortBy] = sortType;

      if (length === -1) {
        return await this.tagModel.find(filter).sort(sortObj);
      }
      return await this.tagModel
        .find(filter)
        .sort(sortObj)
        .limit(length)
        .skip(start);
    } catch (e) {
      this.logService.error({
        name: 'TagService/listing',
        e,
      });
    }

    if (isCounting) {
      return 0;
    }
    return [];
  }
}
