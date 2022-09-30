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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FaqService } from '@/modules/faq/faq.service';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { DataTableParams } from '@/common/params/DataTableParams';
import { IdParam } from '@/common/params/IdParam';
import { CreateFaq } from '@/modules/faq/dto/create-faq';
import { EditFaq } from '@/modules/faq/dto/edit-faq';

@ApiTags('Faq')
@Controller('faq')
export class FaqController {
  constructor(private faqService: FaqService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('listing')
  async getProfile(@Request() req, @Body() datatableParams: DataTableParams) {
    const params = datatableParams.getDataTableParams();
    const listObj = await this.faqService.listing(
      false,
      params.keyword,
      params.start,
      params.length,
      params.orderBy,
      params.orderType,
    );
    const count = await this.faqService.listing(true, params.keyword);

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
  async add(@Request() req, @Body() createFaq: CreateFaq) {
    const data = await this.faqService.create(createFaq);

    return {
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @Put(':id')
  async update(@Param() idParam: IdParam, @Body() editFaq: EditFaq) {
    const data = await this.faqService.update(idParam.id, editFaq);

    return {
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @Delete(':id')
  async delete(@Param() idParam: IdParam) {
    const data = await this.faqService.delete(idParam.id);

    return {
      data,
    };
  }

  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('get-list-faq')
  async SelectList(@Body() datatableParams, @Request() req) {
    const listObj = await this.faqService.listing(
      false,
      datatableParams.search,
      datatableParams.page * 10,
      -1,
      'order',
      'asc',
    );
    const count = await this.faqService.listing(true, datatableParams.search);

    return {
      recordsTotal: count,
      data: listObj,
      draw: datatableParams.draw,
      recordsFiltered: count,
    };
  }
}
