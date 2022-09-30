import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { DataTableParams } from '@/common/params/DataTableParams';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { IdParam } from '@/common/params/IdParam';
import { KeywordService } from '@/modules/keyword/keyword.service';
import { CreateKeyword } from '@/modules/keyword/dto/create-keyword';
import { EditKeyword } from '@/modules/keyword/dto/edit-keyword';

@ApiBearerAuth()
@ApiTags('Keyword')
@Controller('keyword')
export class KeywordController {
  constructor(private keywordService: KeywordService) {
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('listing')
  async listForDatatable(
    @Request() req,
    @Body() datatableParams: DataTableParams,
  ) {
    const params = datatableParams.getDataTableParams();
    const listObj = await this.keywordService.listing(
      false,
      params.keyword,
      params.start,
      params.length,
      params.orderBy,
      params.orderType,
    );
    const count = await this.keywordService.listing(true, params.keyword);

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
    const listObj = await this.keywordService.listing(
      false,
      datatableParams.search,
      datatableParams.page * 10,
      -1,
      'name',
      'asc',
    );
    const count = await this.keywordService.listing(
      true,
      datatableParams.search,
    );

    return {
      recordsTotal: count,
      data: listObj,
      draw: datatableParams.draw,
      recordsFiltered: count,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse()
  @Post('add')
  async add(@Request() req, @Body() createKeyword: CreateKeyword) {
    const data = await this.keywordService.create(createKeyword);

    return {
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @Put(':id')
  async update(
    @Param() idParam: IdParam,
    @Body() editKeyword: EditKeyword,
  ) {
    const data = await this.keywordService.update(
      idParam.id,
      editKeyword,
    );

    return {
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @Delete(':id')
  async delete(@Param() idParam: IdParam) {
    const data = await this.keywordService.delete(idParam.id);

    return {
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('find-by-keyword')
  async findByKeyword(@Body() datatableParams) {
    const listObj = await this.keywordService.findByKeyword(
      false,
      datatableParams.search,
      datatableParams.page * 10,
      datatableParams.length ? datatableParams.length : 10,
      'name',
      'asc',
    );
    const count = await this.keywordService.findByKeyword(
      true,
      datatableParams.search,
    );

    return {
      recordsTotal: count,
      data: listObj,
      draw: datatableParams.draw,
      recordsFiltered: count,
    };
  }
}
