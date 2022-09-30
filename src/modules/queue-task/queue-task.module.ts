import { Global, Module } from '@nestjs/common';
import { QueueTaskController } from './queue-task.controller';
import { QueueTaskService } from './queue-task.service';
import { MongooseModule } from '@nestjs/mongoose';
import { QueueTaskSchema } from '@/modules/queue-task/queue-task.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'QueueTask', schema: QueueTaskSchema, collection: 'queue_task' }]),
  ],
  controllers: [QueueTaskController],
  providers: [QueueTaskService],
  exports: [QueueTaskService]
})
export class QueueTaskModule {}
