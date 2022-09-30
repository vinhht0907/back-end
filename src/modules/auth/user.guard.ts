import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from '@/modules/auth/auth.service';

@Injectable()
export class UserGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const bearerToken = request.headers.authorization;

    if(bearerToken) {
      const token = bearerToken.substring(7, bearerToken.length)
      const user = await this.authService.verifyToken(token);

      if(user) {
        request.current_user = user
      }
    }

    return true;
  }
}
