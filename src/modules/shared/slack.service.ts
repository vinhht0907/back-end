import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ip = require("ip");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const moment = require('moment');

@Injectable()
export class SlackService {
  constructor(@InjectQueue('slack') private readonly slackQueue: Queue) {}
  async sendMessage(message) {
    if (process.env.ENV === 'production'){
      if(typeof message === 'object'){
        message.ip = ip.address();
        message.time = moment().format("YYYY-MM-DD HH:mm:ss")
      }
      await this.slackQueue.add('sendMessage', message);
    }
  }
}
