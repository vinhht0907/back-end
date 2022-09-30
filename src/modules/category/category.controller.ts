import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  Get,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CategoryService } from '@/modules/category/category.service';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { DataTableParams } from '@/common/params/DataTableParams';
import { IdParam } from '@/common/params/IdParam';
import { CreateCategory } from '@/modules/category/dto/create-category';
import { EditCategory } from '@/modules/category/dto/edit-category';
import { SlugParam } from '@/common/params/SlugParam';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('listing')
  async getProfile(@Request() req, @Body() datatableParams: DataTableParams) {
    const params = datatableParams.getDataTableParams();
    const listObj = await this.categoryService.listing(
      false,
      params.keyword,
      null,
      params.start,
      params.length,
      params.orderBy,
      params.orderType,
    );
    const count = await this.categoryService.listing(
      true,
      params.keyword,
      null,
    );

    return {
      recordsTotal: count,
      data: listObj,
      draw: datatableParams.draw,
      recordsFiltered: count,
    };
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('select-list')
  async SelectList(@Body() datatableParams) {
    const listObj = await this.categoryService.listing(
      false,
      datatableParams.keyword,
      datatableParams.parentType,
      datatableParams.page * 10,
      -1,
      'title',
      'asc',
    );
    const count = await this.categoryService.listing(
      true,
      datatableParams.keyword,
      datatableParams.parentType,
    );

    return {
      recordsTotal: count,
      data: listObj,
      draw: datatableParams.draw,
      recordsFiltered: count,
    };
  }

  @Get('list-all')
  async getCategoryList() {
    const listObj = await this.categoryService.listing(
      false,
      null,
      null,
      0,
      -1,
      'order',
      'asc',
    );
    return { data: listObj };
  }

  @Get('slug/:slug')
  async getBySlug(@Param() slugParam: SlugParam) {
    const data = await this.categoryService.getBySlugAndId(slugParam.slug);

    return {
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse()
  @Post('add')
  async add(@Request() req, @Body() createCategory: CreateCategory) {
    const data = await this.categoryService.create(createCategory);

    return {
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @Put(':id')
  async update(@Param() idParam: IdParam, @Body() editCategory: EditCategory) {
    const data = await this.categoryService.update(idParam.id, editCategory);

    return {
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @Delete(':id')
  async delete(@Param() idParam: IdParam) {
    const data = await this.categoryService.delete(idParam.id);

    return {
      data,
    };
  }
}
