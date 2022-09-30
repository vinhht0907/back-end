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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PostService } from '@/modules/post/post.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { DataTableParams } from '@/common/params/DataTableParams';
import { CreatePost } from '@/modules/post/dto/create-post';
import { IdParam } from '@/common/params/IdParam';
import { EditPost } from '@/modules/post/dto/edit-post';
import { SlugParam } from '@/common/params/SlugParam';
import { ChangeStatus } from '@/modules/post/dto/change-status';
import { FilterDatatable } from '@/modules/post/dto/filter-datatable';
import { Search } from '@/modules/post/dto/search';
import { PagingParams } from '@/common/params/PagingParams';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AdvanceSearch } from '@/modules/post/dto/advance-search';
import { UserGuard } from '@/modules/auth/user.guard';

@ApiTags('Post')
@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('listing')
  async getProfile(
    @Request() req,
    @Body() datatableParams: DataTableParams,
    @Body() filterDatatable: FilterDatatable,
  ) {
    const params = datatableParams.getDataTableParams();
    const listObj = await this.postService.listing(
      false,
      params.keyword,
      filterDatatable,
      params.start,
      params.length,
      params.orderBy,
      params.orderType,
    );
    const count = await this.postService.listing(
      true,
      params.keyword,
      filterDatatable,
    );

    return {
      recordsTotal: count,
      data: listObj,
      draw: datatableParams.draw,
      recordsFiltered: count,
    };
  }

  @UseGuards(UserGuard)
  @Post('search')
  async search(
    @Request() req,
    @Body() search: Search,
    @CurrentUser() currentUser,
  ) {
    const { count, data } = await this.postService.search(search, currentUser);

    return {
      count,
      data,
    };
  }

  @Post('advance-search')
  async advanceSearch(@Body() search: AdvanceSearch) {
    const { count, data } = await this.postService.advanceSearch(search);

    return {
      count,
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('my-post')
  async getMyPost(@Request() req, @Body() params: PagingParams) {
    const count = await this.postService.getMyPost(req.user, true, params);
    const data = await this.postService.getMyPost(req.user, false, params);

    return {
      count,
      data,
    };
  }

  @Post('author-post')
  async getAuthorPost(@Request() req, @Body() params: PagingParams) {
    const count = await this.postService.getAuthorPost(
      req.body.author,
      true,
      params,
    );
    const data = await this.postService.getAuthorPost(
      req.body.author,
      false,
      params,
    );

    return {
      count,
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse()
  @Post('add')
  async add(@Request() req, @Body() createPost: CreatePost) {
    const data = await this.postService.create(req.user, createPost);

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
    @Body() editPost: EditPost,
  ) {
    const data = await this.postService.update(idParam.id, editPost, req.user);

    return {
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @Delete(':id')
  async delete(@Request() req, @Param() idParam: IdParam) {
    const data = await this.postService.delete(req.user, idParam.id);

    return {
      data,
    };
  }

  @Get(':id')
  async getDetail(@Param() idParam: IdParam) {
    const data = await this.postService.getDetail(idParam.id);

    return {
      data,
    };
  }

  @UseGuards(UserGuard)
  @Get('slug/:slug')
  async getBySlug(@CurrentUser() currentUser, @Param() slugParam: SlugParam) {
    const data = await this.postService.getBySlugAndId(
      slugParam.slug,
      currentUser,
    );

    return {
      data,
    };
  }

  @Get(':id/chapters')
  async getChapters(@Param() idParam: IdParam) {
    const data = await this.postService.getChapters(idParam.id);

    return {
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse()
  @Post('reading')
  async getReadingList(@Request() request, @Body() params: PagingParams) {
    const data = await this.postService.getReadingList(
      request.user._id,
      params,
    );

    return data;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse()
  @Post('change-status')
  async changeStatus(@Body() changeStatus: ChangeStatus) {
    const data = await this.postService.changeStatus(changeStatus);

    return {
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse()
  @Post('change-publish-status')
  async changePublishStatus(@Request() request) {
    const data = await this.postService.changePublishStatus(
      request.user,
      request.body._id,
      request.body.publish_status,
    );

    return {
      data,
    };
  }

  @Get(':id/related')
  async getRelated(@Param() idParam: IdParam) {
    const data = await this.postService.getRelatedPosts(idParam.id);

    return {
      data,
    };
  }
}
