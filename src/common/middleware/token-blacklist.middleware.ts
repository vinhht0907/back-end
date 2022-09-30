import {
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { TOKEN_BLACK_LIST } from '@/common/constants/cacheKeys';
import { CacheService } from '@/modules/cache/cache.service';
import {CustomLogger} from "../logger/custom-logger";

@Injectable()
export class TokenBlacklistMiddleware implements NestMiddleware {
  constructor(private cacheService: CacheService, private logService: CustomLogger) {}

  async use(req: Request, res: Response, next: Function) {
    if (
      req.hasOwnProperty('headers') &&
      req.headers.hasOwnProperty('authorization')
    ) {
      try {
        const token = req.headers.authorization.split(' ')[1];

        if(token) {
          const existTokenBlacklist = await this.cacheService.getByKey(
            `${TOKEN_BLACK_LIST}${token}`,
          );

          if (existTokenBlacklist) {
            return res.status(HttpStatus.UNAUTHORIZED).json({
              msg: 'Token Invalid!',
            })
          }
        }
      } catch (err) {
        this.logService.error({
          name: 'TokenBlacklistMiddleware',
          err
        });
      }
    }

    next();
  }
}
