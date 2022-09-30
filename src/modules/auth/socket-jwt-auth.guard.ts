import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WsException } from '@nestjs/websockets';
import { AuthService } from '@/modules/auth/auth.service';

@Injectable()
export class SocketJwtAuthGuard extends AuthGuard('socket-jwt') {
  constructor(private authService: AuthService) {
    super();
  }

  getRequest(context) {
    return context.switchToWs().getClient().handshake;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const token = context.switchToWs().getClient().handshake.query.token;

    if (typeof token === 'undefined') {
      throw new WsException('Missing token');
    }

    const user = await this.authService.verifyToken(token);

    if (user) {
      if (context.switchToWs().getData()) {
        context.switchToWs().getData().user = user
      }

      return true;
    }

    return false;
  }
}
