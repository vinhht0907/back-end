import { forwardRef, Global, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './user.schema';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';
import { CacheModule } from '../cache/cache.module';
import { RoleSchema } from '../role/role.schema';
import { IsUserAlreadyExist } from './dto/validation/is-user-already-exist';
import { RoleModule } from '@/modules/role/role.module';
import { EmailModule } from '@/modules/email/email.module';
import { PostViewModule } from '@/modules/post-view/post-view.module';
import { FollowAuthorModule } from '@/modules/follow-author/follow-author.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Role', schema: RoleSchema },
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => CacheModule),
    forwardRef(() => RoleModule),
    forwardRef(() => EmailModule),
    forwardRef(() => EmailModule),
    forwardRef(() => PostViewModule),
    forwardRef(() => FollowAuthorModule),
  ],
  providers: [UsersService, IsUserAlreadyExist],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
