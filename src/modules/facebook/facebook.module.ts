import { forwardRef, Global, Module } from '@nestjs/common';
import { FacebookController } from '@/modules/facebook/facebook.controller';
import { FacebookService } from '@/modules/facebook/facebook.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '@/modules/users/users.module';
import { AuthModule } from '@/modules/auth/auth.module';

@Global()
@Module({
  imports: [ConfigModule, UsersModule, forwardRef(() => AuthModule)],
  providers: [FacebookService],
  exports: [FacebookService],
  controllers: [FacebookController],
})
export class FacebookModule {
}
