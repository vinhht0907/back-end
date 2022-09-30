import {Global, Module} from '@nestjs/common';
import {BullModule} from "@nestjs/bull";
import {CustomLogger } from '@/common/logger/custom-logger';
import {SlackService} from "./slack.service";
import {SlackProcessor} from "./processor/slack.processor";
import {BullConfigService} from "./processor/bull-module-config";
import { SuperMemoService } from './super-memo/super-memo.service';

@Global()
@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'slack',
      useClass: BullConfigService
    }),
  ],
  providers: [CustomLogger, SlackService, SlackProcessor, SuperMemoService],
  exports: [CustomLogger, SlackService, SuperMemoService]
})
export class SharedModule {}
