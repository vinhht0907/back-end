import { Injectable } from '@nestjs/common';
import { BullOptionsFactory } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

const Redis = require('ioredis');

@Injectable()
export class BullConfigService implements BullOptionsFactory {
  constructor(private configService: ConfigService) {}

  createBullOptions(): any {
    const redisConnection = this.configService
      .get('REDIS_CONNECTION')
      .split(':')

    return {
      prefix: this.configService.get('REDIS_PREFIX_QUEUE'),
      redis: {
        host: redisConnection[0],
        port: parseInt(redisConnection[1]),
        password: redisConnection[2]
      }
    };
  }
}
