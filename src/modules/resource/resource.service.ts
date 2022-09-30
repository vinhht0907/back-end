import { forwardRef, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomLogger } from '@/common/logger/custom-logger';
import { ResourceInterface } from '@/modules/resource/resource.interface';
import { TopicService } from '@/modules/topic/topic.service';

@Injectable()
export class ResourceService {
  constructor(
    @InjectModel('Resource') private resourceModel: Model<ResourceInterface>,
    private logService: CustomLogger,
    @Inject(forwardRef(() => TopicService))
    private topicService: TopicService,
  ) {
  }

  async getByRole(roleId: string) {
    try {
      return await this.resourceModel.find({ roles: roleId });
    } catch (e) {
      this.logService.error({
        name: 'ResourceService/getByRole',
        e,
      });
    }

    return [];
  }

  async checkExist(permissionName: string, id = null) {
    try {
      let filter = { name: permissionName };

      if (id) {
        // @ts-ignore
        filter = { ...filter, _id: { $ne: id } };
      }

      const count = await this.resourceModel.findOne(filter);
      return count !== null;
    } catch (e) {
      this.logService.error({
        name: 'ResourceService/checkExist',
        e,
      });
    }

    return false;
  }

  async create(obj) {
    try {
      const resource = await this.resourceModel.create(obj);
      return resource;
    } catch (e) {
      this.logService.error({
        name: 'ResourceService/create',
        e,
      });

      throw new InternalServerErrorException();
    }
    return false;
  }

  async update(id, obj) {
    try {
      const resource = await this.resourceModel.findById(id);


      if (resource) {
        await this.resourceModel.updateOne({
          _id: id,
          // eslint-disable-next-line @typescript-eslint/no-empty-function
        }, obj);
        return true;
      }
    } catch (e) {
      this.logService.error({
        name: 'ResourceService/update',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false;
  }

  async delete(id) {
    try {
      const resource = await this.resourceModel.findById(id);

      if (resource) {
        await this.resourceModel.deleteOne({
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

  async addTopicRelationshipWithResource(resourceIds: string, id: string) {
    try {
      const resource = await this.resourceModel.findById(resourceIds);
      if (resource != null) {
        resource.topics = id;
        await resource.save();
      }
    } catch (e) {
      this.logService.error({
        name: 'resourceService/addTopicRelationshipWithResource',
        e,
      });

      throw new InternalServerErrorException();
    }
  }

  async deleteTopicRelationshipWithResource(resourceIds: string[], id: string) {
    try {
      for (let i = 0; i < resourceIds.length; i++) {
        const resource = await this.resourceModel.findById(resourceIds[i]);

        if (resource && resource.topics != null && resource.topics.length > 0) {
          const indexResource = resource.topics.findIndex((e) => {
            return e == id;
          });
          if (indexResource > -1) {
            resource.topics.splice(indexResource, 1);
          }
        }
        await resource.save();
      }
    } catch (e) {
      this.logService.error({
        name: 'resourceService/deleteResourceRelationshipWithresource',
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
        return await this.resourceModel.countDocuments(filter);
      }

      const sortObj = {};
      sortObj[sortBy] = sortType;

      if (length === -1) {
        return await this.resourceModel.find(filter).sort(sortObj);
      }
      return await this.resourceModel
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
        name: 'ResourceService/listing',
        e,
      });
    }

    if (isCounting) {
      return 0;
    }
    return [];
  }
}
