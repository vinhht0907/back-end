import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';
import { UsersService } from './users.service';
import { CacheService } from '../cache/cache.service';
import { TOKEN_BLACK_LIST } from '@/common/constants/cacheKeys';
import { RegisterUser } from './dto/register-user';
import { UpdateProfile } from './dto/update-profile';
import { UpdatePassword } from './dto/update-password';
import { ChangeAccountPasswordDto } from './dto/change-account-password.dto';
import { UpdateFcmToken } from './dto/update-fcm-token';
import { Logout } from './dto/logout';
import { DataTableParams } from '@/common/params/DataTableParams';
import { CreateUser } from '@/modules/users/dto/createUser';
import { IdParam } from '@/common/params/IdParam';
import { EditUser } from '@/modules/users/dto/edit-user';
import { ConfirmEmail } from '@/modules/users/dto/confirm-email';
import { ResendConfirmEmail } from '@/modules/users/dto/resend-confirm-email';
import { Permission } from '@/modules/auth/permission.decorator';
import { USER_MANAGE } from '@/common/constants/permissions';
import { UpdateProfileWithField } from '@/modules/users/dto/UpdateProfileWithField';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { TopSearch } from '@/modules/users/dto/top-search';
import { AuthorSearch } from '@/modules/users/dto/author-search';
import { UserGuard } from '@/modules/auth/user.guard';
import { ForgetPassword } from '@/modules/users/dto/forgetPassword';
import { ResetPassword } from '@/modules/users/dto/reset-password';

@ApiBearerAuth()
@ApiTags('User')
@Controller('user')
export class UsersController {
  constructor(
    private authService: AuthService,
    private userService: UsersService,
    private cacheService: CacheService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    const user = await this.authService.login(req.user);
    return user;
  }

  @Post('register')
  async register(@Body() registerUser: RegisterUser) {
    try {
      const newUser = await this.userService.createUser(registerUser);

      if (newUser) {
        // return await this.authService.login(newUser);
        return await newUser;
      } else {
        throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (e) {
      throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('forget-password')
  async forgetPassword(@Body() forgetPassword: ForgetPassword) {
    try {
      const newUser = await this.userService.forgetPassword(forgetPassword);

      if (newUser) {
        return await newUser;
      } else {
        throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    } catch (e) {
      throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  async getProfile(@Request() req) {
    const user = await this.userService.getProfile(req.user);
    return {
      user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req, @Body() logout: Logout) {
    try {
      if (
        req.hasOwnProperty('headers') &&
        req.headers.hasOwnProperty('authorization')
      ) {
        const token = req.headers.authorization.split(' ')[1];

        if (token) {
          await this.cacheService.put(
            `${TOKEN_BLACK_LIST}${token}`,
            1,
            1209600,
          );
        }

        if (logout.fcmToken) {
          await this.userService.logout(req.user._id, logout.fcmToken);
        }
      }
    } catch (e) {
      throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return {
      mes: 'Logout success!',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-profile')
  async updateProfile(@Request() req, @Body() updateProfile: UpdateProfile) {
    try {
      const result = await this.userService.updateProfile(
        req.user._id,
        updateProfile,
      );

      if (result) {
        return {
          mess: 'success',
        };
      } else {
        return {
          mess: 'error',
        };
      }
    } catch (e) {
      throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-password')
  async updatePassword(@Request() req, @Body() updatePassword: UpdatePassword) {
    try {
      console.log("aaaaa")
      const result = await this.userService.updatePassword(
        updatePassword._id,
        updatePassword.password,
      );

      if (result) {
        return {
          mess: 'success',
        };
      } else {
        return {
          mess: 'error',
        };
      }
    } catch (e) {
      throw new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-account-password')
  async changeAccountPassword(
    @Request() req,
    @Body() changeAccountPasswordDto: ChangeAccountPasswordDto,
  ) {
    const result = await this.userService.changeAccountPassword(
      req.user._id,
      changeAccountPasswordDto.old_password,
      changeAccountPasswordDto.new_password,
    );

    if (result) {
      return {
        mess: 'success',
      };
    } else {
      return {
        mess: 'error',
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-profile-with-field')
  async updateProfileWithField(
    @Request() req,
    @Body() updateProfileWithField: UpdateProfileWithField,
  ) {
    const result = await this.userService.updateProfileWithField(
      req.user._id,
      updateProfileWithField.field,
      updateProfileWithField.updateValue,
    );

    if (result) {
      return {
        mess: 'success',
      };
    } else {
      return {
        mess: 'error',
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-fcm-token')
  async updateFcmToken(@Request() req, @Body() fcmToken: UpdateFcmToken) {
    const result = await this.userService.updateFcmToken(
      req.user._id,
      fcmToken.newToken,
      fcmToken.oldToken,
    );

    if (result) {
      return {
        mess: 'success',
      };
    } else {
      return {
        mess: 'error',
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('listing')
  @Permission(USER_MANAGE)
  async listing(@Request() req, @Body() datatableParams: DataTableParams) {
    const params = datatableParams.getDataTableParams();
    const listObj = await this.userService.listing(
      false,
      params.keyword,
      params.start,
      params.length,
      params.orderBy,
      params.orderType,
    );
    const count = await this.userService.listing(true, params.keyword);

    return {
      recordsTotal: count,
      data: listObj,
      draw: datatableParams.draw,
      recordsFiltered: count,
    };
  }

  @Post('search-author')
  @Permission(USER_MANAGE)
  async searchAuthor(@Request() req, @Body() authorSearch: AuthorSearch) {
    const data = await this.userService.searchAuthor(authorSearch);

    return data;
  }

  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse()
  @Permission(USER_MANAGE)
  @Post('add')
  async add(@Request() req, @Body() createUser: CreateUser) {
    const data = await this.userService.create(createUser);
    return {
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @Permission(USER_MANAGE)
  @Put(':id')
  async update(@Param() idParam: IdParam, @Body() EditUser: EditUser) {
    const data = await this.userService.update(idParam.id, EditUser);

    return {
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @Delete(':id')
  @Permission(USER_MANAGE)
  async delete(@Param() idParam: IdParam) {
    const data = await this.userService.delete(idParam.id);

    return {
      data,
    };
  }

  @ApiCreatedResponse()
  @Post('confirm-email')
  async confirmEmail(@Request() req, @Body() confirmEmail: ConfirmEmail) {
    const data = await this.userService.confirmEmail(confirmEmail);
    return {
      data,
    };
  }

  @ApiCreatedResponse()
  @Post('reset-password')
  async resetPassword(@Request() req, @Body() resetPassword: ResetPassword) {
    const data = await this.userService.resetPassword(resetPassword);
    return {
      data,
    };
  }

  @ApiCreatedResponse()
  @Post('resend-confirm-email')
  async resendConfirmEmail(
    @Request() req,
    @Body() resendConfirmEmail: ResendConfirmEmail,
  ) {
    const data = await this.userService.sendEmailConfirm(
      resendConfirmEmail._id,
    );
    return {
      data,
    };
  }

  @UseGuards(UserGuard)
  @Post('top-author')
  async search(
    @Request() req,
    @Body() search: TopSearch,
    @CurrentUser() currentUser,
  ) {
    const { count, data } = await this.userService.getTopAuthor(
      search,
      currentUser,
    );

    return {
      count,
      data,
    };
  }

  @UseGuards(UserGuard)
  @Get(':id')
  async getAuthorDetail(@Param() idParam: IdParam, @CurrentUser() currentUser) {
    const data = await this.userService.getAuthorInfo(idParam.id, currentUser);

    return {
      data,
    };
  }
}
