import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from '@/modules/email/email.service';
import { ApiTags } from '@nestjs/swagger';
import { SentEmail } from '@/modules/email/dto/sent-email';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService:EmailService) {
  }

  @Post('sent-email')
  sendMail(@Body() sentEmail: SentEmail): any {
    console.log('test send email')
    // @ts-ignore
    return this.emailService.sentEmail(sentEmail);
  }
}
