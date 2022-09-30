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
import { TagService } from '@/modules/tag/tag.service';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { SearchTag } from '@/modules/tag/dto/search-tag';
import { DataTableParams } from '@/common/params/DataTableParams';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { IdParam } from '@/common/params/IdParam';
import { Permission } from '@/modules/auth/permission.decorator';
import { TAG_MANAGE } from '@/common/constants/permissions';
import { CreateTag } from '@/modules/tag/dto/create-tag';
import { EditTag } from '@/modules/tag/dto/edit-tag';

@ApiTags('Tag')
@ApiBearerAuth()
@Controller('tag')
export class TagController {
  constructor(private tagService: TagService) {}

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('search')
  async Search(@Body() searchTag: SearchTag) {
    const data = await this.tagService.search(
      searchTag
    );

    return data
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UsePipes(new ValidationPipe({ transform: true }))
  @Permission(TAG_MANAGE)
  @Post('listing')
  async listForDatatable(
    @Request() req,
    @Body() datatableParams: DataTableParams,
  ) {
    const params = datatableParams.getDataTableParams();
    const listObj = await this.tagService.listing(
      false,
      params.keyword,
      params.start,
      params.length,
      params.orderBy,
      params.orderType,
    );
    const count = await this.tagService.listing(true, params.keyword);

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
  async add(@Request() req, @Body() createTag: CreateTag) {
    const data = await this.tagService.create(createTag);

    return {
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @Permission(TAG_MANAGE)
  @Put(':id')
  async update(
    @Param() idParam: IdParam,
    @Body() editTag: EditTag,
  ) {
    const data = await this.tagService.update(
      idParam.id,
      editTag,
    );

    return {
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @Permission(TAG_MANAGE)
  @Delete(':id')
  async delete(@Param() idParam: IdParam) {
    const data = await this.tagService.delete(idParam.id);

    return {
      data,
    };
  }
}
