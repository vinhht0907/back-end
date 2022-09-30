import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { WebClient } = require('@slack/web-api');

@Processor('slack')
export class SlackProcessor {
  @Process('sendMessage')
  handleSendMessage(job: Job) {
    try {
      const token = process.env.SLACK_TOKEN;

      const web = new WebClient(token);

      // This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
      const conversationId = '#team-tung-hoang';

      (async () => {
        // See: https://api.slack.com/methods/chat.postMessage
        const res = await web.chat.postMessage({
          channel: conversationId,
          text: job.data,
        });
      })();
    } catch (e) {
      console.log(e);
    }
  }
}
