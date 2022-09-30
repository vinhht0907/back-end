import { forwardRef, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomLogger } from '@/common/logger/custom-logger';
import { TopicService } from '@/modules/topic/topic.service';
import { KeywordInterface } from '@/modules/keyword/keyword.interface';

@Injectable()
export class KeywordService {
  constructor(
    @InjectModel('Keyword') private keywordModel: Model<KeywordInterface>,
    private logService: CustomLogger,
    @Inject(forwardRef(() => TopicService))
    private topicService: TopicService,
  ) {
  }

  async checkExist(keywordName: string, id = null) {
    try {
      let filter = { name: keywordName };

      if (id) {
        // @ts-ignore
        filter = { ...filter, _id: { $ne: id } };
      }

      const count = await this.keywordModel.findOne(filter);
      return count !== null;
    } catch (e) {
      this.logService.error({
        name: 'KeywordService/checkExist',
        e,
      });
    }

    return false;
  }

  async create(obj) {
    try {
      const keyword = await this.keywordModel.create(obj);
      if (keyword) {
        await this.topicService.addTopicRelationshipWithKeyword(keyword.topics, keyword.id);
      }
    } catch (e) {
      this.logService.error({
        name: 'KeywordService/create',
        e,
      });

      throw new InternalServerErrorException();
    }
    return false;
  }

  async update(id, obj) {
    try {
      const keyword = await this.keywordModel.findById(id);


      if (keyword) {
        if (keyword.topics != null) {
          await this.topicService.deleteTopicRelationshipWithKeyword(keyword.topics, id);
        }
        await this.keywordModel.updateOne({
          _id: id,
          // eslint-disable-next-line @typescript-eslint/no-empty-function
        }, obj);

        if (obj.topics != null && obj.topics.length > 0) {
          const topicIds = obj.topics.map((e) => {
            return e._id;
          });

          await this.topicService.addTopicRelationshipWithKeyword(topicIds, id);
        }

        return true;
      }
    } catch (e) {
      this.logService.error({
        name: 'keywordService/update',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false;
  }

  async delete(id) {
    try {
      const keyword = await this.keywordModel.findById(id);

      if (keyword) {
        if (keyword.topics > 0) {
          await this.topicService.deleteTopicRelationshipWithKeyword(keyword.topics, id);
        }
        await this.keywordModel.deleteOne({
          _id: id,
        });
      }
    } catch (e) {
      this.logService.error({
        name: 'ResourceService/delete',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false;
  }

  async addTopicRelationshipWithKeyword(keywordIds: string[], id: string) {
    try {
      for (let i = 0; i < keywordIds.length; i++) {
        const keyword = await this.keywordModel.findById(keywordIds[i]);
        if (keyword && keyword.topics != null && keyword.topics.length > 0) {
          if (!keyword.topics.includes(id)) {
            keyword.topics.push(id);
          }
        } else {
          keyword.topics = [id];
        }
        await keyword.save();
      }
    } catch (e) {
      this.logService.error({
        name: 'keywordService/addTopicRelationshipWithKeyword',
        e,
      });

      throw new InternalServerErrorException();
    }
  }

  async deleteTopicRelationshipWithKeyword(keywordIds: string[], id: string) {
    try {
      for (let i = 0; i < keywordIds.length; i++) {
        const keyword = await this.keywordModel.findById(keywordIds[i]);

        if (keyword && keyword.topics != null && keyword.topics.length > 0) {
          const indexKeyword = keyword.topics.findIndex((e) => {
            return e == id;
          });
          if (indexKeyword > -1) {
            keyword.topics.splice(indexKeyword, 1);
          }
        }
        await keyword.save();
      }
    } catch (e) {
      this.logService.error({
        name: 'keywordService/deleteResourceRelationshipWithKeyword',
        e,
      });

      throw new InternalServerErrorException();
    }
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
            { link: { $regex: `.*${keyword}.*` } },
          ],
        };
      }

      if (isCounting) {
        return await this.keywordModel.countDocuments(filter);
      }

      const sortObj = {};
      sortObj[sortBy] = sortType;

      if (length === -1) {
        return await this.keywordModel.find(filter).sort(sortObj);
      }
      return await this.keywordModel
        .find(filter)
        .populate({
            path: 'topics',
          },
        )
        .sort(sortObj)
        .limit(length)
        .skip(start);
    } catch (e) {
      this.logService.error({
        name: 'KeywordService/listing',
        e,
      });
    }

    if (isCounting) {
      return 0;
    }
    return [];
  }

  async findByKeyword(isCounting = false, keyword = null, start = 0, length = 10, sortBy = 'name', sortType = 'asc',
  ) {
    try {
      let filter = {};
      if (keyword) {
        filter = {
          $or: [
            { name: { $regex: `.*${keyword}.*` } },
          ],
        };
      }

      if (isCounting) {
        return await this.keywordModel.countDocuments(filter);
      }

      const sortObj = {};
      sortObj[sortBy] = sortType;

      if (length === -1) {
        return await this.keywordModel.find(filter).sort(sortObj);
      }
      return await this.keywordModel
        .find(filter)
        .populate({
            path: 'topics',
            select: '_id name link description resources',
            populate: {
              path: 'resources',
              select: '_id name link',
            },
          },
        )

        .sort(sortObj)
        .limit(length)
        .skip(start);
    } catch (e) {
      this.logService.error({
        name: 'KeywordService/findByKeyword',
        e,
      });
    }

    if (isCounting) {
      return 0;
    }
    return [];
  }
}
