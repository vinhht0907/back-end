import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from "mongoose";
import { CustomLogger } from '@/common/logger/custom-logger';
import { QueueTask } from '@/modules/queue-task/queue-task.interface';

@Injectable()
export class QueueTaskService {
  constructor(
    @InjectModel('QueueTask') private queueTaskModel: Model<QueueTask>,
    private logService: CustomLogger,
  ) {}

  async addQueue(obj) {
    try {
      const newObj = await this.queueTaskModel.create(obj)

      return newObj;
    } catch (e) {
      this.logService.log('QueueTaskService/addQueue', e)
    }

    return false;
  }

  async updateQueueStatus(id, queueName, status, error = null) {
    try {
      const obj = await this.queueTaskModel.findOne({id: id, queue_name: queueName})

      if(obj) {
        obj.status = status

        if(error) {
          obj.error = error
        }

        await obj.save()

        return true
      }
    }catch (e) {
      this.logService.log('QueueTaskService/updateQueueStatus', e)
    }

    return false
  }

  async getTask(title, queueName) {
    try {
      const task = await this.queueTaskModel.findOne({
        queue_name: queueName,
        'data.title': title
      })

      return task;
    }catch (e) {
      this.logService.log('QueueTaskService/getTask', e)
    }

    return null
  }
}
