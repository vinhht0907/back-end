import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomLogger } from '@/common/logger/custom-logger';
import { Faq } from '@/modules/faq/faq.interface';

@Injectable()
export class FaqService {
  constructor(
    @InjectModel('Faq') private faqModel: Model<Faq>,
    private logService: CustomLogger,
  ) {}

  async checkExist(title: string, id = null) {
    try {
      let filter = { title: title };

      if (id) {
        // @ts-ignore
        filter = { ...filter, _id: { $ne: id } };
      }

      const count = await this.faqModel.findOne(filter);
      return count !== null;
    } catch (e) {
      this.logService.error({
        name: 'faqService/checkExist',
        e,
      });
    }

    return false;
  }

  async create(obj) {
    try {
      const order = await this.faqModel
        .find()
        .sort('-order')
        .limit(1);
      if (order && order.length > 0) {
        obj.order = order[0].order + 1;
      } else {
        obj.order = 1;
      }
      return await this.faqModel.create(obj);
    } catch (e) {
      this.logService.error({
        name: 'faqService/create',
        e,
      });

      throw new InternalServerErrorException();
    }
  }

  async update(id, obj) {
    try {
      const faq = await this.faqModel.findById(id);

      if (faq) {
        await this.faqModel.updateOne(
          {
            _id: id,
          },
          obj,
        );

        return true;
      }
    } catch (e) {
      this.logService.error({
        name: 'faqService/update',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false;
  }

  async delete(id) {
    try {
      const faq = await this.faqModel.findById(id);

      if (faq) {
        await this.faqModel.deleteOne({
          _id: id,
        });
      }
    } catch (e) {
      this.logService.error({
        name: 'faqService/delete',
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
          $or: [{ title: { $regex: `.*${keyword}.*` } }],
        };
      }

      if (isCounting) {
        return await this.faqModel.countDocuments(filter);
      }

      const sortObj = {};
      sortObj[sortBy] = sortType;

      if (length === -1) {
        return await this.faqModel.find(filter).sort(sortObj);
      }
      return await this.faqModel
        .find(filter)
        .sort(sortObj)
        .limit(length)
        .skip(start);
    } catch (e) {
      this.logService.error({
        name: 'faqService/listing',
        e,
      });
    }

    if (isCounting) {
      return 0;
    }
    return [];
  }
}
