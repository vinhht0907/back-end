import { forwardRef, Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import {ConfigModule, ConfigService} from "@nestjs/config";
import { SocketJwtStrategy } from '@/modules/auth/socket-jwt.strategy';

@Global()
@Module({
  imports: [
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: `${configService.get('JWT_TTL')}s` },
      }),
      inject: [ConfigService]
    }),
    forwardRef(() => UsersModule),
    PassportModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, SocketJwtStrategy],
  exports: [AuthService],
  controllers: [],

})
export class AuthModule {

}
