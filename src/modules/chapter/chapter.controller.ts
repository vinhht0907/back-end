import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ChapterService } from '@/modules/chapter/chapter.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { CreateChapter } from '@/modules/chapter/dto/create-chapter';
import { IdParam } from '@/common/params/IdParam';
import { EditChapter } from '@/modules/chapter/dto/edit-chapter';
import { SlugParam } from '@/common/params/SlugParam';
import { UserGuard } from '@/modules/auth/user.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ViewChapter } from '@/modules/chapter/dto/view-chapter';
import { ChangeOrder } from '@/modules/chapter/dto/change-order';

@ApiTags('Chapter')
@Controller('chapter')
export class ChapterController {
  constructor(private chapterService: ChapterService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse()
  @Post('add')
  async add(@Request() req, @Body() createChapter: CreateChapter) {
    const data = await this.chapterService.create(req.user, createChapter);

    return {
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @Put(':id')
  async update(
    @Request() req,
    @Param() idParam: IdParam,
    @Body() editChapter: EditChapter,
  ) {
    const data = await this.chapterService.update(
      idParam.id,
      editChapter,
      req.user,
    );

    return {
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @Delete(':id')
  async delete(@Request() req, @Param() idParam: IdParam) {
    const data = await this.chapterService.delete(req.user, idParam.id);

    return {
      data,
    };
  }

  @Get(':id')
  async getDetail(@Param() idParam: IdParam) {
    return await this.chapterService.getDetail(idParam.id);
  }

  @UseGuards(UserGuard)
  @Get('slug/:slug')
  async getBySlug(
    @Request() req,
    @CurrentUser() currentUser,
    @Param() slugParam: SlugParam,
  ) {
    const data = await this.chapterService.getBySlugAndId(
      req,
      currentUser,
      slugParam.slug,
    );

    return {
      data,
    };
  }

  @UseGuards(UserGuard)
  @Post('ur')
  async updateView(
    @Request() req,
    @CurrentUser() currentUser,
    @Body() viewChapter: ViewChapter,
  ) {
    const data = await this.chapterService.increaseViewCount(
      req,
      currentUser,
      viewChapter.chapter,
    );

    return {
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('change-order')
  async changeOrder(@Request() req, @Body() changeOrder: ChangeOrder) {
    const data = await this.chapterService.changeOrder(
      req.user,
      changeOrder.postId,
      changeOrder.arrayId,
    );

    return {
      data,
    };
  }
}
