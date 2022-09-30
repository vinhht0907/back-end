import { Injectable } from '@nestjs/common';
import { CustomLogger } from '@/common/logger/custom-logger';

const Redis = require('ioredis');
const RedisTimeout = require('ioredis-timeout');

@Injectable()
export class CacheService {
  private redisClient: any;

  constructor(private logService: CustomLogger) {
    const redisConnection = process.env.REDIS_CONNECTION.split(':');
    console.log("redisConnection ", redisConnection)

    this.redisClient = new Redis({
      host: redisConnection[0],
      port: parseInt(redisConnection[1]),
      password: redisConnection[2]
    }, {
      clusterRetryStrategy(times) {
        logService.error({
          name: 'Redis auto-reconnect',
          times,
        });
        return 500;
      },
      keyPrefix: process.env.REDIS_PREFIX,
      showFriendlyErrorStack: true,
      reconnectOnError: function(err) {
        return true;
      },
    });

    RedisTimeout.timeout('get', 500, this.redisClient);
  }

  async getByKey(key, defaultValue = null) {
    try {
      const val = await this.redisClient.get(key);

      return val;
    } catch (e) {
      this.logService.error({
        name: 'getByKey',
        e,
      });
    }

    return defaultValue;
  }

  async put(
    key: string,
    value: any,
    expireTime: undefined | number = null,
  ): Promise<void> {
    try {
      if (expireTime) {
        await this.redisClient.set(key, value, 'EX', expireTime);
      } else {
        await this.redisClient.set(key, value);
      }
    } catch (e) {
      this.logService.error({
        name: 'cache put',
        e,
      });
    }
  }

  async rememberBuffer(
    key: string,
    func: Function,
    timeToLive = -1,
  ): Promise<any> {
    try {
      const val = await this.redisClient.getBuffer(key);
      if (typeof val !== 'undefined' && val !== null) {
        return val;
      }

      const callbackResult = await func();
      if (timeToLive === -1) {
        await this.redisClient.set(key, callbackResult);
      } else {
        await this.redisClient.set(key, callbackResult, 'EX', timeToLive);
      }

      return callbackResult;
    } catch (e) {
      this.logService.error({
        name: 'rememberBuffer',
        e,
      });
    }

    return null;
  }


  async rememberForever(
    key: string,
    func: Function,
    defaultValue = null,
    timeToLive = 3600,
    tags: undefined | string | Array<string> = null,
  ): Promise<any> {
    try {
      const val = await this.redisClient.get(key);
      if (typeof val !== 'undefined' && val !== null) {
        return JSON.parse(val);
      }
      const callbackResult = await func();

      if (timeToLive) {
        this.redisClient.set(
          key,
          JSON.stringify(callbackResult),
          'EX',
          timeToLive,
        );
      } else {
        this.redisClient.set(key, JSON.stringify(callbackResult));
      }

      if (tags) {
        if (Array.isArray(tags)) {
          await Promise.all(tags.map(item => this.setTag(item, key)));
        } else {
          await this.setTag(tags, key);
        }
      }

      return callbackResult;
    } catch (e) {
      this.logService.error({
        name: 'rememberForever',
        e,
      });

      try {
        const callbackResult = await func();
        return callbackResult;
      } catch (e) {
        this.logService.error({
          name: 'rememberForever next',
          e,
        });

        return defaultValue;
      }
    }
  }

  async removeTag(tag: string | Array<string>): Promise<void> {
    try {
      if (Array.isArray(tag)) {
        await Promise.all(tag.map(item => this.removeSingleTag(item)));
      } else {
        await this.removeSingleTag(tag);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async removeSingleTag(tag: string): Promise<void> {
    try {
      const tagVal = await this.redisClient.get('tag' + ':' + tag);
      if (tagVal) {
        const arr = JSON.parse(tagVal);
        await Promise.all([
          this.flushCache(arr),
          this.flushCache('tag' + ':' + tag),
        ]);
      }
    } catch (e) {
      this.logService.error({
        name: 'removeSingleTag',
        e,
      });
    }
  }

  async flushCache(key: string | Array<string>): Promise<void> {
    if (Array.isArray(key)) {
      await Promise.all(key.map(val => this.redisClient.del(val)));
    } else {
      await this.redisClient.del(key);
    }
  }

  async setTag(tagStr: string, key: string): Promise<void> {
    const tag = await this.redisClient.get('tag' + ':' + tagStr);
    let arr = [key];
    if (tag) {
      arr = JSON.parse(tag);

      if (arr.indexOf(key) === -1) {
        arr.push(key);
      }
    }

    await this.redisClient.set('tag' + ':' + tagStr, JSON.stringify(arr));
  }
}
