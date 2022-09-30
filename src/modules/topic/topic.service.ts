import { forwardRef, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CustomLogger } from '@/common/logger/custom-logger';
import { TopicInterface } from '@/modules/topic/topic.interface';
import { ResourceService } from '@/modules/resource/resource.service';
import { KeywordService } from '@/modules/keyword/keyword.service';

@Injectable()
export class TopicService {
  constructor(
    @InjectModel('Topic') private topicModel: Model<TopicInterface>,
    private logService: CustomLogger,
    @Inject(forwardRef(() => ResourceService))
    private resourceService: ResourceService,
    @Inject(forwardRef(() => KeywordService))
    private keywordService: KeywordService,
  ) {
  }

  async addTopicRelationshipWithKeyword(topicsIds: string[], keywordId: string) {
    try {
      for (let i = 0; i < topicsIds.length; i++) {
        const topic = await this.topicModel.findById(topicsIds[i]);
        if (topic && topic.keywords != null && topic.keywords.length > 0) {
          if (!topic.keywords.includes(keywordId)) {
            topic.keywords.push(keywordId);
          }
        } else {
          topic.keywords = [keywordId];
        }
        await topic.save();
      }
    } catch (e) {
      this.logService.error({
        name: 'TopicService/addTopicRelationshipWithKeyword',
        e,
      });

      throw new InternalServerErrorException();
    }
  }

  async deleteTopicRelationshipWithKeyword(topicsIds: string[], keywordId: string) {
    try {
      for (let i = 0; i < topicsIds.length; i++) {
        const topic = await this.topicModel.findById(topicsIds[i]);
        if (topic && topic.keywords != null && topic.keywords.length > 0) {
          const indexKeyword = topic.keywords.findIndex((e) => {
            return e == keywordId;
          });
          if (indexKeyword > -1) {
            topic.keywords.splice(indexKeyword, 1);
          }
        }
        await topic.save();
      }
    } catch (e) {
      this.logService.error({
        name: 'TopicService/deleteTopicRelationshipWithKeyword',
        e,
      });

      throw new InternalServerErrorException();
    }
  }

  async addResourceRelationshipWithTopic(topicsIds: string[], id: string) {
    try {
      for (let i = 0; i < topicsIds.length; i++) {
        const topic = await this.topicModel.findById(topicsIds[i]);
        if (topic && topic.resources != null && topic.resources.length > 0) {
          if (!topic.resources.includes(id)) {
            topic.resources.push(id);
          }
        } else {
          topic.resources = [id];
        }
        await topic.save();
      }
    } catch (e) {
      this.logService.error({
        name: 'TopicService/addResourceRelationshipWithTopic',
        e,
      });

      throw new InternalServerErrorException();
    }
  }

  async deleteResourceRelationshipWithTopic(topicsIds: string[], id: string) {
    try {
      for (let i = 0; i < topicsIds.length; i++) {
        const topic = await this.topicModel.findById(topicsIds[i]);

        if (topic && topic.resources != null && topic.resources.length > 0) {
          const indexKeyword = topic.resources.findIndex((e) => {
            return e == id;
          });
          if (indexKeyword > -1) {
            topic.resources.splice(indexKeyword, 1);
          }
        }
        await topic.save();
      }
    } catch (e) {
      this.logService.error({
        name: 'TopicService/deleteResourceRelationshipWithTopic',
        e,
      });

      throw new InternalServerErrorException();
    }
  }

  async checkExist(resourceName: string, id = null) {
    try {
      let filter = { name: resourceName };

      if (id) {
        // @ts-ignore
        filter = { ...filter, _id: { $ne: id } };
      }

      const count = await this.topicModel.findOne(filter);
      return count !== null;
    } catch (e) {
      this.logService.error({
        name: 'TopicService/checkExist',
        e,
      });
    }

    return false;
  }

  async create(obj) {
    try {
      const topic = await this.topicModel.create(obj);
      await this.resourceService.addTopicRelationshipWithResource(obj.resources._id, topic.id);
      return true;
    } catch (e) {
      this.logService.error({
        name: 'TopicService/create',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false;
  }

  async update(id, obj) {
    try {
      const topic = await this.topicModel.findById(id);

      if (topic) {
        if (topic.resources!=null){
          await this.resourceService.deleteTopicRelationshipWithResource(topic.resources, id);
        }
        await this.topicModel.updateOne({
          _id: id,
        }, obj);

        if (obj.resources != null && obj.resources.length > 0) {
          const resourceIds = obj.resources.map((e) => {
            return e._id;
          });

          await this.resourceService.addTopicRelationshipWithResource(resourceIds, id);
        }

        return true;
      }
    } catch (e) {
      this.logService.error({
        name: 'TopicService/update',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false;
  }

  async delete(id) {
    try {
      const resource = await this.topicModel.findById(id);

      if (resource) {
        await this.resourceService.deleteTopicRelationshipWithResource(resource.resources,resource.id)
        await this.keywordService.deleteTopicRelationshipWithKeyword(resource.keywords,resource.id)
        await this.topicModel.deleteOne({
          _id: id,
        });
      }
    } catch (e) {
      this.logService.error({
        name: 'TopicService/delete',
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
            { display_name: { $regex: `.*${keyword}.*` } },
            // { description: { $regex: `.*${keyword}.*` } },
          ],
        };
      }

      if (isCounting) {
        return await this.topicModel.countDocuments(filter);
      }

      const sortObj = {};
      sortObj[sortBy] = sortType;

      if (length === -1) {
        return await this.topicModel.find(filter).sort(sortObj);
      }
      return await this.topicModel
        .find(filter)
        .populate({
          path: 'resources',
        })
        .sort(sortObj)
        .limit(length)
        .skip(start);
    } catch (e) {
      this.logService.error({
        name: 'TopicService/listing',
        e,
      });
    }

    if (isCounting) {
      return 0;
    }
    return [];
  }


}
