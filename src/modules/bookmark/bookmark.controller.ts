import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { BookmarkService } from '@/modules/bookmark/bookmark.service';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { Bookmark } from '@/modules/bookmark/dto/bookmark';
import { PagingParams } from '@/common/params/PagingParams';

@ApiTags('Bookmark')
@Controller('bookmark')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse()
  @Post('bookmark')
  async bookmark(@Request() req, @Body() bookmark: Bookmark) {
    const userId = req.user.id;
    const data = await this.bookmarkService.bookmark(userId, bookmark);

    return {
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse()
  @Post('remove-bookmark')
  async removeBookmark(@Request() req, @Body() bookmark: Bookmark) {
    const userId = req.user.id;
    const data = await this.bookmarkService.removeBookmark(userId, bookmark);

    return {
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse()
  @Post('my-bookmark')
  async getMyBookmark(@Request() req, @Body() pagingParams: PagingParams) {
    const userId = req.user.id;
    const data = await this.bookmarkService.getMyBookmark(userId, pagingParams);

    return data;
  }
}
