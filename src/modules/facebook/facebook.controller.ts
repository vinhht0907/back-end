import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { FacebookService } from '@/modules/facebook/facebook.service';
import { UsersService } from '@/modules/users/users.service';
import { AuthService } from '@/modules/auth/auth.service';

@Controller('facebook')
export class FacebookController {
  constructor(
    private readonly facebookService: FacebookService,
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  @Get('oauth/callback')
  async callback(@Req() request) {
    const user = await this.facebookService.getAccessTokenFromCode(
      request.query.code,
    );

    console.log('facebook/oauth/callback', user);

    if (user) {
      if (user.email) {
        const existUser = await this.userService.findExistUserByFacebook(
          user.email,
        );

        if (existUser) {
          return await this.authService.login(existUser);
        }
      } else {
        const existUser = await this.userService.findExistUserByFacebookId(
          user.id,
        );

        if (existUser) {
          return await this.authService.login(existUser);
        } else {
          const initUser = {
            facebook: user,
            full_name: user.name ? user.name : null,
            name: user.first_name ? user.first_name : null,
            avatar:
              user.picture && user.picture.data && user.picture.data.url
                ? user.picture.data.url
                : null,
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
      }
    } else {
      return null;
    }
  }
}
