import { Logger } from '@nestjs/common';
import {SlackService } from '@/modules/shared/slack.service';

export class CustomLogger extends Logger {
  constructor(private readonly slackService: SlackService) {
    super()
  }

  error(message: any, trace: any = null) {
    super.error(message, trace);

    try{
      console.log(message)
      this.slackService.sendMessage(message)
    }catch (e) {

    }
  }

  debug(message: any, context?: string) {
    super.debug(message, context);
    try{
      this.slackService.sendMessage(message)
    }catch (e) {
    }
  }
}
