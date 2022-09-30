import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService, private configService: ConfigService) {
  }

  public async sentEmail(
    sentEmail,
  ) {
    let result = false;
    await this.mailerService
      .sendMail({
        to: sentEmail.to ? sentEmail.to : '',
        from: sentEmail.from ? sentEmail.from : this.configService.get('EMAIL_USER_NAME'),
        cc: sentEmail.cc ? sentEmail.cc : '',
        subject: sentEmail.subject ? sentEmail.subject : 'Testing Nest MailerModule ✔',
        text: sentEmail.text ? sentEmail.text : '',
        html: sentEmail.html ? sentEmail.html : '',
      })
      .then(success => {
        console.log('success', success);
        result = true;
      })
      .catch(err => {
        console.log('err', err);
        result = false;
      });
    return result;
  }
}
