import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomLogger } from '@/common/logger/custom-logger';
import { Newsletter } from '@/modules/newsletter/newsletter.interface';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel('NewsLetter') private newsLetterModel: Model<Newsletter>,
    private logService: CustomLogger,
  ) {
  }

  async create(obj) {
    try {
      const newsLetter = await this.newsLetterModel.findOne({ 'email': obj.email });
      if (newsLetter) {
        return newsLetter;
      } else {
        return await this.newsLetterModel.create(obj);
      }
    } catch (e) {
      this.logService.error({
        name: 'newsLetterService/create',
        e,
      });

      throw new InternalServerErrorException();
    }
  }
}
