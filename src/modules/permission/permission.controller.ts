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
import { PermissionService } from '@/modules/permission/permission.service';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { DataTableParams } from '@/common/params/DataTableParams';
import { CreatePermission } from '@/modules/permission/dto/create-permission';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EditPermission } from '@/modules/permission/dto/edit-permission';
import { IdParam } from '@/common/params/IdParam';
import { Permission } from '@/modules/auth/permission.decorator';
import { PERMISSION_MANAGE } from '@/common/constants/permissions';

@ApiBearerAuth()
@ApiTags('Permission')
@Controller('permission')
@Permission(PERMISSION_MANAGE)
export class PermissionController {
  constructor(private permissionService: PermissionService) {}

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('listing')
  async listForDatatable(
    @Request() req,
    @Body() datatableParams: DataTableParams,
  ) {
    const params = datatableParams.getDataTableParams();
    const listObj = await this.permissionService.listing(
      false,
      params.keyword,
      params.start,
      params.length,
      params.orderBy,
      params.orderType,
    );
    const count = await this.permissionService.listing(true, params.keyword);

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
    const listObj = await this.permissionService.listing(
      false,
      datatableParams.search,
      datatableParams.page * 10,
      -1,
      'display_name',
      'asc',
    );
    const count = await this.permissionService.listing(
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
  async add(@Request() req, @Body() createPermission: CreatePermission) {
    const data = await this.permissionService.create(createPermission);

    return {
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @Put(':id')
  async update(
    @Param() idParam: IdParam,
    @Body() editPermission: EditPermission,
  ) {
    const data = await this.permissionService.update(
      idParam.id,
      editPermission,
    );

    return {
      data,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @Delete(':id')
  async delete(@Param() idParam: IdParam) {
    const data = await this.permissionService.delete(idParam.id);

    return {
      data,
    };
  }
}
