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
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { PageService } from '@/modules/page/page.service';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { DataTableParams } from '@/common/params/DataTableParams';
import { IdParam } from '@/common/params/IdParam';
import { CreatePage } from '@/modules/page/dto/create-page';
import { EditPage } from '@/modules/page/dto/edit-page';

@ApiTags('Page')
@Controller('page')
export class PageController {
  constructor(private pageService: PageService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('listing')
  async getProfile(@Request() req, @Body() datatableParams: DataTableParams) {
    const params = datatableParams.getDataTableParams();
    const listObj = await this.pageService.listing(
      false,
      params.keyword,
      params.start,
      params.length,
      params.orderBy,
      params.orderType,
    );
    const count = await this.pageService.listing(true, params.keyword);

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
  async add(@Request() req, @Body() createPage: CreatePage) {
    const data = await this.pageService.create(createPage);

    return {
      data
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @Put(':id')
  async update(
    @Param() idParam: IdParam,
    @Body() editPage: EditPage
  ) {
    const data = await this.pageService.update(idParam.id, editPage);

    return {
      data
    };
  }

  @ApiNoContentResponse()
  @Get(':slug')
  async getBySlug(
    @Param() params,
  ) {
    const data = await this.pageService.getBySlug(params.slug);

    return {
      data
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @Delete(':id')
  async delete(
    @Param() idParam: IdParam
  ) {
    const data = await this.pageService.delete(idParam.id);

    return {
      data
    };
  }
}
