import { Body, Controller, Param, Post, Put, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { FeedbackService } from '@/modules/feedback/feedback.service';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { DataTableParams } from '@/common/params/DataTableParams';
import { CreateFaq } from '@/modules/faq/dto/create-faq';
import { IdParam } from '@/common/params/IdParam';
import { CreateFeedback } from '@/modules/feedback/dto/create-feedback';

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('listing')
  async getProfile(@Request() req, @Body() datatableParams: DataTableParams) {
    const params = datatableParams.getDataTableParams();
    const listObj = await this.feedbackService.listing(
      false,
      params.keyword,
      params.start,
      params.length,
      params.orderBy,
      params.orderType,
    );
    const count = await this.feedbackService.listing(true, params.keyword);

    return {
      recordsTotal: count,
      data: listObj,
      draw: datatableParams.draw,
      recordsFiltered: count,
    };
  }

  @ApiCreatedResponse()
  @Post('sent-feedback')
  async add(@Request() req, @Body() createFeedback: CreateFeedback) {
    const data = await this.feedbackService.create(createFeedback);

    return {
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @Put(':id')
  async update(
    @Param() idParam: IdParam,
  ) {
    const data = await this.feedbackService.update(idParam.id);

    return {
      data,
    };
  }
}
