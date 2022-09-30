import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from '@/modules/notification/notification.interface';

const moment = require('moment');

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification') private notificationModel: Model<Notification>,
  ) {}

  async addNotifications(notifications) {
    try {
      await this.notificationModel.insertMany(notifications);

      return true;
    } catch (e) {
      console.log(e);
    }

    return false;
  }

  async findAll(userId, params): Promise<any> {
    try {
      const filter = { user: userId };

      const { page = 0, length = 10 } = params;

      const result = await this.notificationModel
        .find(filter)
        .sort({ created_at: 'desc' })
        .skip(page * length)
        .limit(length)
        .lean();

      const count = await this.notificationModel.find(filter).countDocuments();
      const unreadCount = await this.notificationModel
        .find({
          user: userId,
          read_at: { $exists: false },
        })
        .countDocuments();

      return { data: result, totalCount: count, unreadCount: unreadCount };
    } catch (e) {
      console.log(e);
    }

    return { data: [], totalCount: 0, unreadCount: 0 };
  }

  async markRead(userId, notificationId) {
    const unreadCount = await this.notificationModel
      .find({
        user: userId,
        _id: notificationId,
        read_at: { $exists: false },
      })
      .countDocuments();

    try {
      const notification = await this.notificationModel.findOne({
        user: userId,
        _id: notificationId,
      });

      if (notification) {
        if (!notification.read_at) {
          notification.read_at = moment().valueOf();
          await notification.save();
        }

        return {
          result: true,
          unreadCount,
        };
      }
    } catch (e) {
      console.log(e);
    }

    return {
      result: false,
      unreadCount,
    };
  }

  async markReadAll(userId) {
    try {
      const res = await this.notificationModel.updateMany(
        {
          user: userId,
          read_at: { $exists: false },
        },
        { read_at: moment().valueOf() },
      );

      if (res) {
        return true;
      }
    } catch (e) {
      console.log(e);
    }

    return false;
  }
}
