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
import { NewsService } from '@/modules/news/news.service';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { DataTableParams } from '@/common/params/DataTableParams';
import { CreateNews } from '@/modules/news/dto/create-news';
import { IdParam } from '@/common/params/IdParam';
import { EditNews } from '@/modules/news/dto/edit-news';
import { SlugParam } from '@/common/params/SlugParam';
import { FilterDatatable } from '@/modules/news/dto/filter-datatable';
import { UserGuard } from '@/modules/auth/user.guard';
import { PagingParams } from '@/common/params/PagingParams';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private newsService: NewsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('listing')
  async getList(
    @Request() req,
    @Body() datatableParams: DataTableParams,
    @Body() filterDatatable: FilterDatatable,
  ) {
    const params = datatableParams.getDataTableParams();
    const listObj = await this.newsService.listing(
      false,
      params.keyword,
      filterDatatable,
      params.start,
      params.length,
      params.orderBy,
      params.orderType,
    );
    const count = await this.newsService.listing(
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

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse()
  @Post('add')
  async add(@Request() req, @Body() createNews: CreateNews) {
    const data = await this.newsService.create(req.user, createNews);

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
    @Body() editNews: EditNews,
  ) {
    const data = await this.newsService.update(idParam.id, editNews);

    return {
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @Delete(':id')
  async delete(@Request() req, @Param() idParam: IdParam) {
    const data = await this.newsService.delete(idParam.id);

    return {
      data,
    };
  }

  @Get(':id')
  async getDetail(@Param() idParam: IdParam) {
    const data = await this.newsService.getDetail(idParam.id);

    return {
      data,
    };
  }

  @UseGuards(UserGuard)
  @Get('slug/:slug')
  async getBySlug(@Param() slugParam: SlugParam) {
    const data = await this.newsService.getBySlugAndId(slugParam.slug);

    return {
      data,
    };
  }

  @ApiBearerAuth()
  @Post('get-by-category')
  async getByCategory(@Body() params: PagingParams) {
    const data = await this.newsService.getByCategory(params);

    return data;
  }
}
