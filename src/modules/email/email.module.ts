import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          // tls: {
          //   ciphers: 'SSLv3',
          // },
          secure: false,
          auth: {
            user: configService.get('EMAIL_USER_NAME'),
            pass: configService.get('EMAIL_PASSWORD'),
          },
        },
        defaults: {
          from: '"Vietlit" ' + configService.get('EMAIL_USER_NAME'),
        },
      }),
      imports: [ConfigModule],
      inject: [ConfigService],
    })],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {
  imports: [];
}
