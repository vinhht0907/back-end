import { Controller, Get, Req } from '@nestjs/common';
import { GoogleService } from '@/modules/google/google.service';
import { UsersService } from '@/modules/users/users.service';
import { AuthService } from '@/modules/auth/auth.service';

@Controller('google')
export class GoogleController {
  constructor(
    private readonly googleService: GoogleService,
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  @Get('oauth/callback')
  async callback(@Req() request) {
    const user = await this.googleService.getAccessTokenFromCode(request);

    console.log('google/oauth/callback', user);

    if (user && user.email) {
      const existUser = await this.userService.findExistUserByGoogle(
        user.email,
      );
      if (existUser) {
        return await this.authService.login(existUser);
      } else {
        const initUser = {
          google: user,
          full_name: user.name ? user.name : null,
          name: user.name ? user.name : null,
          avatar: user.picture ? user.picture : null,
          email: user.email,
          status: 'active',
        };

        const newUser = await this.userService.createUserFromSocial(initUser);
        if (newUser) {
          return await this.authService.login(newUser);
        } else {
          return null;
        }
      }
    } else {
      return null;
    }
  }
}
