import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class UserVipGuard implements CanActivate {

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user.is_vip;
  }
}