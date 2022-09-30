import {
  OnQueueActive,
  OnQueueCleaned,
  OnQueueCompleted,
  OnQueueError,
  OnQueueFailed,
  OnQueuePaused,
  OnQueueProgress,
  OnQueueRemoved,
  OnQueueResumed,
  OnQueueStalled,
  OnQueueWaiting,
} from '@nestjs/bull';
import { Job } from 'bull';
import { QueueTaskService } from '@/modules/queue-task/queue-task.service';

const ip = require("ip");

export class BaseConsumer {
  private taskService: QueueTaskService;
  constructor(queueTaskService: QueueTaskService, private queue) {
    this.taskService = queueTaskService;
  }

  @OnQueueActive()
  async onActive(jobId) {
    await this.updateJobStatus(jobId, 'active')
  }

  @OnQueueError()
  onError(job: Job) {
    console.log('error', job);
  }

  @OnQueueWaiting()
  async onWaiting(jobId) {
    const job = await this.queue.getJob(jobId);
    if (job) {
      const result = await this.taskService.addQueue({
        id: jobId,
        name: job.data && job.data.title ? job.data.title : null,
        queue_name: job.queue.name,
        status: 'waiting',
        data: job.data,
        ip: ip.address()
      });

      if(result === null) {
        await job.remove()
      }
    }
  }

  @OnQueueStalled()
  async onStalled(jobId) {
    await this.updateJobStatus(jobId, 'stalled')
  }

  @OnQueueProgress()
  async onProgress(jobId) {
    await this.updateJobStatus(jobId, 'progress')
  }

  @OnQueueCompleted()
  async onCompleted(jobId) {
    await this.updateJobStatus(jobId, 'completed')
  }

  @OnQueueFailed()
  async onFailed(jobId, error) {
    await this.updateJobStatus(jobId, 'failed', error)
  }

  @OnQueuePaused()
  onPaused(job) {
    console.log('onPaused', job);
  }

  @OnQueueResumed()
  async onResumed(jobId) {
    await this.updateJobStatus(jobId, 'resumed')
  }

  @OnQueueCleaned()
  onCleaned(jobs) {
    console.log('onCleaned', jobs);
  }

  @OnQueueRemoved()
  async onRemoved(jobId) {
    await this.updateJobStatus(jobId, 'removed')
  }

  private async updateJobStatus(jobId, status, error = null) {
    const job = await this.queue.getJob(jobId);

    if (job) {
      await this.taskService.updateQueueStatus(jobId, job.queue.name, status, error);
    }
  }
}
