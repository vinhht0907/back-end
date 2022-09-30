import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { FollowAuthorService } from '@/modules/follow-author/follow-author.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { AuthorToFollow } from '@/modules/follow-author/dto/author-to-follow';
import { PagingParams } from '@/common/params/PagingParams';

@ApiTags('Follow Author')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('follow-author')
export class FollowAuthorController {
  constructor(private followAuthorService: FollowAuthorService) {}

  @Post('toggle-follow')
  async toggleFollow(@Request() req, @Body() authorToFollow: AuthorToFollow) {
    return await this.followAuthorService.toggleFollow(
      req.user,
      authorToFollow.author,
    );
  }

  @Post('my-follow')
  async myFollow(@Request() req, @Body() pagingParams: PagingParams) {
    return await this.followAuthorService.getMyFollow(req.user, pagingParams);
  }
}
