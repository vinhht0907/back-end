import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Option } from '@/modules/option/option.interface';
import { CustomLogger } from '@/common/logger/custom-logger';

@Injectable()
export class OptionService {
  constructor(
    @InjectModel('Option') private optionModel: Model<Option>,
    private logService: CustomLogger,
  ) {}

  async getOptionByKey(key) {
    try {
      const option = await this.optionModel.findOne({ key });

      return option;
    } catch (e) {
      console.log(e);
    }

    return null;
  }

  async updateOption(key, updateValue) {
    try {
      await this.optionModel.updateOne(
        {
          key,
        },
        updateValue,
      );
    } catch (e) {
      console.log(e);
    }
  }
}
