import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.attempt(email, pass);

    if (user) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, id: user._id, _id: user._id, full_name: user.full_name, avatar: user.avatar };
    const successResult = {
      _id: user._id,
      token: this.jwtService.sign(payload, {
        expiresIn: parseInt(process.env.JWT_TTL),
      }),
      expires_in: parseInt(process.env.JWT_TTL),
    };
    return successResult;
  }

  async verifyToken(token) {
    try {
      const decodeToken = this.jwtService.decode(token);

      if (decodeToken) {
        return decodeToken;
      }
    } catch (e) {

    }

    return false;
  }
}
