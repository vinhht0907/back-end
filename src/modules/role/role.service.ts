import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '@/modules/role/role.interface';
import { CustomLogger } from '@/common/logger/custom-logger';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel('Role') private roleModel: Model<Role>,
    private logService: CustomLogger,
  ) {}

  async getDetail(id) {
    try {
      const obj = await this.roleModel.findById(id)

      if(obj) {
        return obj;
      }
    } catch (e) {
      this.logService.error({
        name: 'RoleService/getDetail',
        e,
      });
    }

    return null
  }

  async getByName(name) {
    try {
      const obj = await this.roleModel.findOne({name: name})

      if(obj) {
        return obj;
      }
    } catch (e) {
      this.logService.error({
        name: 'RoleService/getByName',
        e,
      });
    }

    return null
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
          $or: [
            { name: { $regex: `.*${keyword}.*` } },
            { display_name: { $regex: `.*${keyword}.*` } },
            { description: { $regex: `.*${keyword}.*` } },
          ],
        };
      }
      console.log("keyword 1" , keyword)
      console.log("filter 1" , filter)

      if (isCounting) {
        return await this.roleModel.countDocuments(filter);
      }

      const sortObj = {};
      sortObj[sortBy] = sortType;

      if (length === -1) {
        return await this.roleModel.find(filter).sort(sortObj);
      }
      return await this.roleModel
        .find(filter)
        .sort(sortObj)
        .limit(length)
        .skip(start);
    } catch (e) {
      this.logService.error({
        name: 'RoleService/listing',
        e,
      });
    }

    if (isCounting) {
      return 0;
    }
    return [];
  }

  async create(obj) {
    try {
      return await this.roleModel.create(obj);
    } catch (e) {
      this.logService.error({
        name: 'RoleService/create',
        e,
      });

      throw new InternalServerErrorException();
    }
  }

  async checkExist(roleName: string, id = null) {
    try {
      let filter = { name: roleName };

      if (id) {
        // @ts-ignore
        filter = { ...filter, _id: { $ne: id } };
      }

      const count = await this.roleModel.findOne(filter);
      return count !== null;
    } catch (e) {
      this.logService.error({
        name: 'RoleService/checkExist',
        e,
      });
    }

    return false;
  }

  async update(id, obj) {
    try {
      const role = await this.roleModel.findById(id)

      if(role) {
        await this.roleModel.updateOne({
          _id: id
        }, obj)

        return true
      }
    }catch (e) {
      this.logService.error({
        name: 'RoleService/update',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false;
  }

  async delete(id) {
    try {
      const permission = await this.roleModel.findById(id)

      if(permission) {
        await this.roleModel.deleteOne({
          _id: id
        })
      }
    }catch (e) {
      this.logService.error({
        name: 'RoleService/delete',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false
  }
}
