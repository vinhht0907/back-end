import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from '@/modules/permission/permission.interface';
import { CustomLogger } from '@/common/logger/custom-logger';

@Injectable()
export class PermissionService {
  constructor(
    @InjectModel('Permission') private permissionModel: Model<Permission>,
    private logService: CustomLogger,
  ) {}

  async getByRole(roleId: string) {
    try {
      return await this.permissionModel.find({ roles: roleId });
    } catch (e) {
      this.logService.error({
        name: 'PermissionService/getByRole',
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

      const count = await this.permissionModel.findOne(filter);
      return count !== null;
    } catch (e) {
      this.logService.error({
        name: 'PermissionService/checkExist',
        e,
      });
    }

    return false;
  }

  async create(obj) {
    try {
      return await this.permissionModel.create(obj);
    } catch (e) {
      this.logService.error({
        name: 'PermissionService/create',
        e,
      });

      throw new InternalServerErrorException();
    }
  }

  async update(id, obj) {
    try {
      const permission = await this.permissionModel.findById(id)

      if(permission) {
        await this.permissionModel.updateOne({
          _id: id
        }, obj)

        return true
      }
    }catch (e) {
      this.logService.error({
        name: 'PermissionService/update',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false;
  }

  async delete(id) {
    try {
      const permission = await this.permissionModel.findById(id)

      if(permission) {
        await this.permissionModel.deleteOne({
          _id: id
        })
      }
    }catch (e) {
      this.logService.error({
        name: 'PermissionService/delete',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false
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
        return await this.permissionModel.countDocuments(filter);
      }

      const sortObj = {};
      sortObj[sortBy] = sortType;

      if (length === -1) {
        return await this.permissionModel.find(filter).sort(sortObj);
      }
      return await this.permissionModel
        .find(filter)
        .sort(sortObj)
        .limit(length)
        .skip(start);
    } catch (e) {
      this.logService.error({
        name: 'PermissionService/listing',
        e,
      });
    }

    if (isCounting) {
      return 0;
    }
    return [];
  }
}
