import { forwardRef, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '@/modules/users/users.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { GoogleService } from '@/modules/google/google.service';
import { GoogleController } from '@/modules/google/google.controller';

@Global()
@Module({
  imports: [ConfigModule, UsersModule, forwardRef(() => AuthModule)],
  providers: [GoogleService],
  exports: [GoogleService],
  controllers: [GoogleController],
})
export class GoogleModule {
}
