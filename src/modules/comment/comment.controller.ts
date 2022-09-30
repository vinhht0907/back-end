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
import { CommentService } from '@/modules/comment/comment.service';
import { CreateComment } from '@/modules/comment/dto/create-comment';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse()
  @Post('add')
  async add(@Request() req, @Body() createComment: CreateComment) {
    const data = await this.commentService.create(req.user, createComment);
    return {
      data,
    };
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('list-comment')
  async SelectList(@Body() datatableParams) {
    const listObj = await this.commentService.listing(
      false,
      datatableParams.post,
      datatableParams.chapter,
      datatableParams.page * datatableParams.length,
      datatableParams.length,
      datatableParams.orderBy ? datatableParams.orderBy : 'created_at',
      'desc',
    );
    const count = await this.commentService.listing(
      true,
      datatableParams.post,
      datatableParams.chapter,
    );

    return {
      recordsTotal: count,
      data: listObj,
      draw: datatableParams.draw,
      recordsFiltered: count,
    };
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('list-child-comment')
  async SelectChildList(@Body() datatableParams) {
    const listObj = await this.commentService.listingChild(
      false,
      datatableParams.post,
      datatableParams.parent_comment,
      datatableParams.page * datatableParams.length,
      datatableParams.length,
      datatableParams.orderBy ? datatableParams.orderBy : 'created_at',
      'desc',
    );
    const count = await this.commentService.listingChild(
      true,
      datatableParams.post,
      datatableParams.parent_comment,
    );

    return {
      recordsTotal: count,
      data: listObj,
      draw: datatableParams.draw,
      recordsFiltered: count,
    };
  }
}
