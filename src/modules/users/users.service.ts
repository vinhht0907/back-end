import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './interfaces/user.interface';
import { CustomLogger } from '@/common/logger/custom-logger';
import { UpdateProfile } from './dto/update-profile';
import { RoleService } from '@/modules/role/role.service';
import { EmailService } from '@/modules/email/email.service';
import * as AWS from 'aws-sdk';
import { NORMAL } from '@/common/constants/roles';
import * as dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';
import { TopSearch } from '@/modules/users/dto/top-search';
import { PostService } from '@/modules/post/post.service';
import { PostViewService } from '@/modules/post-view/post-view.service';
import { FollowAuthorService } from '@/modules/follow-author/follow-author.service';

const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');
const moment = require('moment');

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    private roleService: RoleService,
    private logService: CustomLogger,
    private emailService: EmailService,
    private configService: ConfigService,
    private postService: PostService,
    @Inject(forwardRef(() => PostViewService))
    private postViewService: PostViewService,
    @Inject(forwardRef(() => FollowAuthorService))
    private followAuthorService: FollowAuthorService,
  ) {
    AWS.config.update({
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      region: process.env.AWS_DEFAULT_REGION,
    });
  }

  private timeFormat = 'YYYY-MM-DD HH:mm:ss';

  async findById(userId: string): Promise<any> {
    const obj = await this.userModel
      .findById(userId)
      .select(
        '-password -password_reset_token -password_reset_expired -time_expired_active -code_active',
      );

    return obj;
  }

  async findByEmail(email: string): Promise<any> {
    const obj = await this.userModel
      .findOne({ email: email })
      .select(
        '-password -password_reset_token -password_reset_expired -time_expired_active -code_active',
      );

    return obj;
  }

  async comparePassword(plainPass: string, password: string): Promise<boolean> {
    return await bcrypt.compare(plainPass, password);
  }

  async attempt(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    let result = {
      status: 'notExist',
      canReturnToken: false,
      password: null,
      _id: null,
    };
    if (user) {
      const matchPassword = await this.comparePassword(password, user.password);
      if (
        user.status == 'active' &&
        matchPassword) {
        result = { ...user.toObject(), canReturnToken: true };
      } else {
        const { status, _id } = user;
        result = { status, canReturnToken: false, password: null, _id };
      }
    }

    return result;
  }

  async createUser(user) {
    try {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      user.status = 'pending';
      const role = await this.roleService.getByName(NORMAL);
      user.role = role._id;
      user.time_expired_active = dayjs().add(2, 'day');

      const newUser = await this.userModel.create(user);
      if (newUser) {
        this.sendEmailConfirm(newUser._id);
        const obj = newUser.toObject();
        delete obj.password;
        return obj;
      }
    } catch (e) {
      console.log(e);
      this.logService.error({
        name: 'UserService/update',
        e,
      });

      throw new InternalServerErrorException();
    }

    return null;
  }

  async forgetPassword(user) {
    try {
      const userExist = await this.userModel.findOne({ email: user.email });
      if (userExist) {
        this.sendEmailForgetPassword(userExist._id);
        return {
          code: 200,
          message: 'Gửi email tìm lại mật khẩu thành công',
        };
      } else {
        return {
          code: 400,
          message: 'Email của bạn không tồn tại, vui lòng kiểm tra lại email',
        };
      }
    } catch (e) {
      console.log(e);
      this.logService.error({
        name: 'UserService/forgetPassword',
        e,
      });

      throw new InternalServerErrorException();
    }

    return null;
  }

  async createUserFromSocial(user) {
    try {
      user.status = 'active';
      const role = await this.roleService.getByName(NORMAL);
      user.role = role._id;
      const newUser = await this.userModel.create(user);
      return newUser;
    } catch (e) {
      console.log(e);
      this.logService.error({
        name: 'UserService/createUserFromSocial',
        e,
      });
      throw new InternalServerErrorException();
    }

    return null;
  }

  async sendEmailConfirm(id) {
    try {
      const user = await this.userModel.findById(id);
      const code = this.makeId();
      user.code_active = code;
      await user.save();
      if (user) {
        const linkActive =
          this.configService.get('URL_ACTIVE_ACCOUNT') + user._id + '/' + code;
        const result = await this.emailService.sentEmail({
          to: user.email,
          from: this.configService.get('EMAIL_USER_NAME'),
          subject: 'Email xác thực tài khoản',
          html: `<p>Chào bạn ✨ <br/>
Cảm ơn bạn vì đã tạo tài khoản cùng VietLit! Chúng mình rất vui được chào đón bạn tới cộng đồng này. <br/>

Để kích hoạt tài khoản, hãy nhấn vào đường liên kết sau: <a href="${linkActive}">${linkActive}</a><br/>

Nếu đường link chưa hoạt động ngay, hãy thử sao chép và dán nó vào thanh địa chỉ trình duyệt rồi nhấn ENTER nhé!<br/>

Chúng mình chúc bạn ngày lành và mong bạn sẽ có trải nghiệm thật vui cùng trang web. <br/>

Thân ái,<br/>
Đội ngũ VietLit.
    </p>`,
        });
        return result;
      }
      return false;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async sendEmailForgetPassword(id) {
    try {
      const user = await this.userModel.findById(id);
      const code = this.makeId();
      user.code_forget_password = code;
      user.time_expired_forget_password = dayjs()
        .add(1, 'day')
        .toDate();
      user.is_forget_password = true;
      await user.save();
      if (user) {
        const linkActive =
          this.configService.get('URL_RESET_PASSWORD_ACCOUNT') +
          user._id +
          '/' +
          code;
        const result = await this.emailService.sentEmail({
          to: user.email,
          from: this.configService.get('EMAIL_USER_NAME'),
          subject: 'Cập nhật mật khẩu mới',
          html: `<p>Chào bạn ✨ <br/>
Cảm ơn bạn vì đã tham gia cùng VietLit! Chúng mình rất vui được chào đón bạn tới cộng đồng này. <br/>

Để tìm lại mật khẩu, hãy nhấn vào đường liên kết sau: <a href="${linkActive}">${linkActive}</a><br/>

Nếu đường link chưa hoạt động ngay, hãy thử sao chép và dán nó vào thanh địa chỉ trình duyệt rồi nhấn ENTER nhé!<br/>

Chúng mình chúc bạn ngày lành và mong bạn sẽ có trải nghiệm thật vui cùng trang web. <br/>

Thân ái,<br/>
Đội ngũ VietLit.
    </p>`,
        });
        return result;
      }
      return false;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async confirmEmail(params) {
    if (params._id && params.code_active) {
      const user = await this.userModel.findById(params._id);
      if (user) {
        if (
          dayjs().isBefore(dayjs(user.time_expired_active)) &&
          params.code_active == user.code_active
        ) {
          user.status = 'active';
          await user.save();
          return true;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  async resetPassword(params) {
    if (params._id && params.code_forget_password) {
      const user = await this.userModel.findById(params._id);
      if (user) {
        if (
          dayjs().isBefore(dayjs(user.time_expired_forget_password)) &&
          params.code_forget_password == user.code_forget_password && user.is_forget_password == true
        ) {
          const salt = await bcrypt.genSalt(10);
          const password = await bcrypt.hash(params.password, salt);
          user.password = password;
          user.is_forget_password = false
          await user.save();
          return true;
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  async getProfile(user: any): Promise<any> {
    try {
      const profile = await this.userModel
        .findById(user._id)
        .select(
          '-password -password_reset_token -password_reset_expired -time_expired_active -code_active',
        )
        .populate({
          path: 'role',
          populate: {
            path: 'permissions',
          },
        })
        .lean();

      return profile;
    } catch (e) {
      this.logService.error({
        name: 'getProfile',
        e,
      });
    }

    return null;
  }

  makeId(length = 48) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  getSttToken() {
    const key = this.makeId();
    const token = CryptoJS.AES.encrypt(process.env.GOOGLE_STT, key).toString();

    return {
      stt_key: key,
      stt_token: token,
    };
  }

  async updateCurrentCourse(id: string, courseId: string) {
    try {
      const collection = await this.userModel.findById(id);

      if (collection) {
        collection.current_course = courseId;
        if (await collection.save()) {
          return true;
        }
      }
    } catch (e) {
      throw new HttpException(
        'Update Current Course Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return false;
  }

  async updateCurrentLesson(id: string, lessonId: string) {
    try {
      const collection = await this.userModel.findById(id);

      if (collection) {
        collection.current_lesson = lessonId;
        if (await collection.save()) {
          return true;
        }
      }
    } catch (e) {
      throw new HttpException(
        'Update Current Lesson Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return false;
  }

  async checkExist(email: string, userId = null): Promise<boolean> {
    try {
      let filter = { email: email };

      if (userId) {
        // @ts-ignore
        filter = { ...filter, _id: { $ne: userId } };
      }

      const user = await this.userModel.findOne(filter);

      if (user) {
        return true;
      }
    } catch (e) {
      this.logService.error({
        name: 'findOneByEmail',
        e,
      });
    }

    return false;
  }

  async checkExistById(id: string): Promise<boolean> {
    try {
      const user = await this.userModel.findById(id);

      if (user) {
        return true;
      }
    } catch (e) {
      this.logService.error({
        name: 'checkExistById',
        e,
      });
    }

    return false;
  }

  async findExistUserByFacebook(email) {
    try {
      const user = await this.userModel.findOne({ email: email });

      if (user) {
        return user;
      }

      return false;
    } catch (e) {
      this.logService.error({
        name: 'findExistUserByFacebook',
        e,
      });
    }

    return false;
  }

  async findExistUserByFacebookId(fbId) {
    try {
      const user = await this.userModel.findOne({ 'facebook.id': fbId });

      if (user) {
        return user;
      }

      return false;
    } catch (e) {
      this.logService.error({
        name: 'findExistUserByFacebook',
        e,
      });
    }

    return false;
  }

  async findExistUserByGoogle(email) {
    try {
      const user = await this.userModel.findOne({ email: email });

      if (user) {
        return user;
      }

      return false;
    } catch (e) {
      this.logService.error({
        name: 'findExistUserByGoogle',
        e,
      });
    }

    return false;
  }

  async updateProfile(id: string, profile: UpdateProfile): Promise<boolean> {
    try {
      let user = await this.userModel.findById(id);

      if (user) {
        user = Object.assign(user, profile);

        if (profile.full_name) {
          if (profile.full_name.lastIndexOf(' ') != -1) {
            user.name = profile.full_name.substring(
              profile.full_name.lastIndexOf(' ') + 1,
            );
          } else {
            user.name = profile.full_name;
          }
        } else {
          user.name = null;
        }

        user = await user.save();

        if (user) {
          return true;
        }
      }
    } catch (e) {
      this.logService.error({
        name: 'updateProfile',
        e,
      });
    }

    return false;
  }

  async updatePassword(id: string, password: string): Promise<boolean> {
    try {
      let user = await this.userModel.findById(id);

      if (user) {
        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(password, salt);

        user.password = password;
        user = await user.save();

        if (user) {
          return true;
        }
      }
    } catch (e) {
      this.logService.error({
        name: 'updatePassword',
        e,
      });
    }

    return false;
  }

  async changeAccountPassword(
    id: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<any> {
    const user = await this.userModel.findById(id);

    const matchPassword = await this.comparePassword(
      oldPassword,
      user.password,
    );
    if (!matchPassword) {
      throw new BadRequestException('Mật khẩu cũ không chính xác!');
    }

    const salt = await bcrypt.genSalt(10);
    newPassword = await bcrypt.hash(newPassword, salt);

    user.password = newPassword;
    return await user.save();
  }

  async updateProfileWithField(
    id: string,
    field: string,
    updateValue: string,
  ): Promise<any> {
    if (id && field && updateValue) {
      const user = await this.userModel.findById(id);
      if (user) {
        user[field] = updateValue;
        return await user.save();
      }
    }

    return null;
  }

  async updateFcmToken(
    id: string,
    newToken: string = null,
    oldToken: string = null,
  ): Promise<any> {
    const user = await this.userModel.findById(id);
    let fcmToken = [];

    if (user.fcm_token && user.fcm_token.length > 0) {
      if (oldToken) {
        fcmToken = user.fcm_token.filter(e => {
          return e != oldToken && e != newToken;
        });
      } else {
        fcmToken = user.fcm_token;
      }
      if (newToken) {
        fcmToken.push(newToken);
      }
    } else {
      if (newToken) {
        fcmToken = [newToken];
      }
    }

    user.fcm_token = fcmToken;

    return await user.save();
  }

  async logout(id: string, oldToken: string): Promise<any> {
    const user = await this.userModel.findById(id);
    if (user.fcm_token && user.fcm_token.length > 0) {
      const fcmToken = await user.fcm_token.filter(e => {
        return e != oldToken;
      });
      user.fcm_token = fcmToken;
    }

    return await user.save();
  }

  async findAllByRole(roleName, params, onlyCount = false) {
    try {
      const role = await this.roleService.getByName(roleName);

      if (role) {
        const {
          page = 0,
          length = 10,
          keyword = null,
          status = 'active',
        } = params;
        let filter = { role: role._id };

        if (status !== null && status !== undefined) {
          // @ts-ignore
          filter = { ...filter, status: status };
        }

        if (keyword) {
          filter = {
            ...filter,
            // @ts-ignore
            full_name: { $regex: new RegExp(`.*${keyword}.*`, 'i') },
          };
        }

        delete params.keyword;
        delete params.status;
        delete params.page;
        delete params.length;

        filter = { ...filter, ...params };

        let result = [];

        if (!onlyCount) {
          if (length < 0) {
            result = await this.userModel
              .find(filter)
              .select(
                '-created_at -updated_at -password -password_reset_token -password_reset_expired -time_expired_active -code_active',
              )
              .populate('class', '_id name')
              .populate('school', '_id name')
              .sort({ name: 'asc' })
              .lean();
          } else {
            result = await this.userModel
              .find(filter)
              .select(
                '-created_at -updated_at -password -password_reset_token -password_reset_expired -time_expired_active -code_active',
              )
              .populate('class', '_id name')
              .populate('school', '_id name')
              .sort({ name: 'asc' })
              .skip(page * length)
              .limit(length)
              .lean();
          }
        }

        const count = await this.userModel.find(filter).countDocuments();

        return { data: result, totalCount: count };
      }
    } catch (e) {
      this.logService.error({
        name: 'UserService/findAllByRole',
        e,
      });
    }

    return { data: [], totalCount: 0 };
  }

  async getDetail(id) {
    try {
      const user = await this.userModel
        .findById(id)
        .select(
          '-password -password_reset_token -password_reset_expired -time_expired_active -code_active',
        );

      if (user) {
        return user;
      }
    } catch (e) {
      this.logService.error({
        name: 'getDetail',
        e,
      });
    }

    return null;
  }

  async getAuthorInfo(userId, currentUser = null) {
    try {
      const user = await this.userModel
        .findById(userId)
        .select(
          '-password -password_reset_token -password_reset_expired -time_expired_active -code_active',
        )
        .populate('post_count')
        .populate('follow_count');

      if (user) {
        const result = user.toObject();

        if (currentUser) {
          const isFollow = await this.followAuthorService.checkFollow(
            currentUser,
            userId,
          );

          // @ts-ignore
          result.is_follow = isFollow;
        }

        return result;
      }
    } catch (e) {
      this.logService.error({
        name: 'getDetail',
        e,
      });
    }

    return null;
  }

  async listing(
    isCounting = false,
    keyword = null,
    start = 0,
    length = 10,
    sortBy = 'order',
    sortType = 'asc',
  ) {
    try {
      let filter = {};
      if (keyword) {
        filter = {
          $or: [
            { name: { $regex: `.*${keyword}.*` } },
            { full_name: { $regex: `.*${keyword}.*` } },
            { description: { $regex: `.*${keyword}.*` } },
          ],
        };
      }

      if (isCounting) {
        return await this.userModel.countDocuments(filter);
      }

      const sortObj = {};
      sortObj[sortBy] = sortType;

      if (length === -1) {
        return await this.userModel.find(filter).sort(sortObj);
      }
      return await this.userModel
        .find(filter)
        .sort(sortObj)
        .populate({
          path: 'role',
          populate: {
            path: 'permissions',
          },
        })
        .limit(length)
        .skip(start);
    } catch (e) {
      this.logService.error({
        name: 'UserService/listing',
        e,
      });
    }

    if (isCounting) {
      return 0;
    }
    return [];
  }

  async searchAuthor(params) {
    try {
      const { keyword, length, page } = params;
      const sortObj = { name: 'asc' };

      let filter = {};
      if (keyword) {
        filter = {
          $or: [
            { name: { $regex: new RegExp(`${keyword}`, 'i') } },
            { full_name: { $regex: new RegExp(`${keyword}`, 'i') } },
          ],
        };
      }

      const count = await this.userModel.countDocuments(filter);

      const data = await this.userModel
        .find(filter)
        .select(
          '-password -password_reset_token -password_reset_expired -time_expired_active -code_active',
        )
        .sort(sortObj)
        .limit(length)
        .skip(page * length)
        .populate('top_post')
        .populate('post_count');

      return { count, data };
    } catch (e) {
      console.log(e);
    }

    return { count: 0, data: [] };
  }

  async create(user) {
    try {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);

      const newUser = await this.userModel.create(user);
      if (newUser) {
        const obj = newUser.toObject();
        delete obj.password;
        return obj;
      }
    } catch (e) {
      this.logService.error({
        name: 'UserService/create',
        e,
      });

      throw new InternalServerErrorException();
    }
  }

  async update(id, obj) {
    try {
      const user = await this.userModel.findById(id);

      if (user) {
        await this.userModel.updateOne(
          {
            _id: id,
          },
          obj,
        );

        return true;
      }
    } catch (e) {
      this.logService.error({
        name: 'UserService/update',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false;
  }

  async delete(id) {
    try {
      const user = await this.userModel.findById(id);

      if (user) {
        await this.userModel.deleteOne({
          _id: id,
        });
      }
    } catch (e) {
      this.logService.error({
        name: 'UserService/delete',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false;
  }

  async updateAvatarInfo(id, avatar, thumb_avatar) {
    try {
      const user = await this.userModel.findById(id);

      if (user) {
        user.avatar = avatar;
        user.thumb_avatar = thumb_avatar;
        return await user.save();
      }
    } catch (e) {
      this.logService.error({
        name: 'UserService/updateAvatarInfo',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false;
  }

  async updateCoverInfo(id, cover, thumb_cover) {
    try {
      const user = await this.userModel.findById(id);

      if (user) {
        user.cover = cover;
        user.thumb_cover = thumb_cover;
        return await user.save();
      }
    } catch (e) {
      this.logService.error({
        name: 'UserService/updateCoverInfo',
        e,
      });

      throw new InternalServerErrorException();
    }

    return false;
  }

  async getTopAuthor(searchParams: TopSearch, currentUser = null) {
    try {
      let startTime = moment()
        .startOf('day')
        .format(this.timeFormat);
      const endTime = moment()
        .endOf('day')
        .format(this.timeFormat);

      let result = null;

      if (searchParams.timeRange === 'all') {
        let data = [];

        if (currentUser) {
          data = await this.userModel
            .find({})
            .select(
              '-password -password_reset_token -password_reset_expired -time_expired_active -code_active',
            )
            .sort({ view_count: -1 })
            .limit(searchParams.length)
            .skip(
              searchParams.length * searchParams.page +
                (searchParams.skip || 0),
            )
            .populate('top_post')
            .populate('post_count')
            .populate({ path: 'is_follow', match: { user: currentUser._id } });
        } else {
          data = await this.userModel
            .find({})
            .select(
              '-password -password_reset_token -password_reset_expired -time_expired_active -code_active',
            )
            .sort({ view_count: -1 })
            .limit(searchParams.length)
            .skip(
              searchParams.length * searchParams.page +
                (searchParams.skip || 0),
            )
            .populate('top_post')
            .populate('post_count');
        }

        const count =
          (await this.userModel.countDocuments({})) - (searchParams.skip || 0);

        result = { count, data };
      } else {
        switch (searchParams.timeRange) {
          case 'week':
            startTime = moment()
              .subtract(6, 'days')
              .startOf('day')
              .format(this.timeFormat);
            break;
          case 'month':
            startTime = moment()
              .subtract(29, 'days')
              .startOf('day')
              .format(this.timeFormat);
            break;
        }

        result = await this.postViewService.getTopAuthorByTimeRange(
          startTime,
          endTime,
          searchParams.length * searchParams.page + (searchParams.skip || 0),
          searchParams.length,
        );
      }

      if (result != null && result.data.length > 0) {
        const populate = [
          {
            path: 'top_post',
          },
          {
            path: 'follow_count',
          },
          {
            path: 'post_count',
          },
        ];

        if (currentUser) {
          populate.push({
            path: 'is_follow',
            // @ts-ignore
            match: { user: currentUser._id },
          });
        }

        const authors = await this.userModel.populate(result.data, {
          path: 'author',
          select:
            '-password -password_reset_token -password_reset_expired -time_expired_active -code_active',
          populate: populate,
        });

        return {
          count: result.count,
          data: authors.map(item => {
            // @ts-ignore
            const obj = item.author
              ? // @ts-ignore
                { ...item.author.toObject() }
              : { ...item.toObject() };
            // @ts-ignore
            obj.statistic_view = item.author ? item.count : item.view_count;

            return obj;
          }),
        };
      }
    } catch (e) {
      console.log(e);
    }

    return { count: 0, data: [] };
  }

  async increaseViewCount(userId) {
    try {
      await this.userModel.updateOne(
        { _id: userId },
        {
          $inc: { view_count: 1 },
        },
        {
          timestamps: false,
        },
      );

      return true;
    } catch (e) {
      console.log(e);
    }

    return false;
  }
}
