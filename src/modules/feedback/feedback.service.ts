import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomLogger } from '@/common/logger/custom-logger';
import { Feedback } from '@/modules/feedback/feedback.interface';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel('Feedback') private feedbackModel: Model<Feedback>,
    private logService: CustomLogger,
  ) {
  }

  async create(obj) {
    try {
      return await this.feedbackModel.create(obj);
    } catch (e) {
      this.logService.error({
        name: 'feedbackService/create',
        e,
      });

      throw new InternalServerErrorException();
    }
  }

  async update(id) {
    try {
      const feedback = await this.feedbackModel.findById(id);

      if (feedback) {
        feedback.status = 'read'
        await feedback.save()
        return true;
      }
    } catch (e) {
      this.logService.error({
        name: 'feedbackService/update',
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
            { email: { $regex: `.*${keyword}.*` } },
            { content: { $regex: `.*${keyword}.*` } },
          ],
        };
      }

      if (isCounting) {
        return await this.feedbackModel.countDocuments(filter);
      }

      const sortObj = {};
      sortObj[sortBy] = sortType;

      if (length === -1) {
        return await this.feedbackModel.find(filter).sort(sortObj);
      }
      return await this.feedbackModel
        .find(filter)
        .sort(sortObj)
        .limit(length)
        .skip(start);
    } catch (e) {
      this.logService.error({
        name: 'feedbackService/listing',
        e,
      });
    }

    if (isCounting) {
      return 0;
    }
    return [];
  }
}
