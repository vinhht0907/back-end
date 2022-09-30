import { Body, Controller, Post, Request } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { NewsletterService } from '@/modules/newsletter/newsletter.service';
import { CreateNewsLetter } from '@/modules/newsletter/dto/create-news-letter';

@ApiTags('Newsletter')
@Controller('news-letter')
export class NewsletterController {
  constructor(private newsletterService: NewsletterService) {
  }

  @ApiCreatedResponse()
  @Post('create')
  async add(@Request() req, @Body() createNewsLetter: CreateNewsLetter) {
    const data = await this.newsletterService.create(createNewsLetter);

    return {
      data,
    };
  }
}
