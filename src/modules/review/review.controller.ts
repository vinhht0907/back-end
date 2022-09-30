import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { ReviewService } from '@/modules/review/review.service';
import { CreateReview } from '@/modules/review/dto/create-review';
import { Vote } from '@/modules/review/dto/vote';

@ApiTags('Review')
@Controller('review')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse()
  @Post('add')
  async add(@Request() req, @Body() createReview: CreateReview) {
    const data = await this.reviewService.create(req.user, createReview);
    return {
      data,
    };
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('list-review')
  async SelectList(@Body() datatableParams) {
    const listObj = await this.reviewService.listing(
      false,
      datatableParams.search,
      datatableParams.post,
      datatableParams.user,
      datatableParams.page * datatableParams.length,
      datatableParams.length,
      datatableParams.orderBy ? datatableParams.orderBy : 'vote',
      'desc',
    );
    const count = await this.reviewService.listing(
      true,
      datatableParams.search,
      datatableParams.post,
      datatableParams.user,
    );

    return {
      recordsTotal: count,
      data: listObj,
      draw: datatableParams.draw,
      recordsFiltered: count,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse()
  @Post('vote')
  async vote(@Request() req, @Body() vote: Vote) {
    const userId = req.user.id;
    const data = await this.reviewService.vote(userId, vote);
    return {
      data,
    };
  }
}
