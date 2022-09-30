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
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { RoleService } from '@/modules/role/role.service';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { DataTableParams } from '@/common/params/DataTableParams';
import { CreateRole } from '@/modules/role/dto/create-role';
import { IdParam } from '@/common/params/IdParam';
import { EditRole } from '@/modules/role/dto/edit-role';
import { Permission } from '@/modules/auth/permission.decorator';
import { ROLE_MANAGE } from '@/common/constants/permissions';

@ApiBearerAuth()
@ApiTags('Role')
@Permission(ROLE_MANAGE)
@Controller('role')
export class RoleController {
  constructor(private roleService: RoleService) {}

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post('listing')
  async getProfile(@Request() req, @Body() datatableParams: DataTableParams) {
    const params = datatableParams.getDataTableParams();
    const listObj = await this.roleService.listing(
      false,
      params.keyword,
      params.start,
      params.length,
      params.orderBy,
      params.orderType,
    );
    const count = await this.roleService.listing(true, params.keyword);

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
    const listObj = await this.roleService.listing(
      false,
      datatableParams.keyword,
      datatableParams.page * 10,
      -1,
      'display_name',
      'asc',
    );
    console.log("listObjtest " , listObj)
    const count = await this.roleService.listing(true, datatableParams.search);

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
  async add(@Request() req, @Body() createRole: CreateRole) {
    if (createRole.hasOwnProperty('permissionIdList')) {
      // @ts-ignore
      createRole.permissions = createRole.permissionIdList
      createRole.permissionIdList = undefined
    } else {
      // @ts-ignore
      createRole.permissions = []
    }
    const data = await this.roleService.create(createRole);

    return {
      data
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @Put(':id')
  async update(
    @Param() idParam: IdParam,
    @Body() editRole: EditRole
  ) {
    if (editRole.hasOwnProperty('permissionIdList')) {
      // @ts-ignore
      editRole.permissions = editRole.permissionIdList
      editRole.permissionIdList = undefined
    } else {
      // @ts-ignore
      editRole.permissions = []
    }
    const data = await this.roleService.update(idParam.id, editRole);

    return {
      data
    };
  }


  @UseGuards(JwtAuthGuard)
  @ApiNoContentResponse()
  @Delete(':id')
  async delete(
    @Param() idParam: IdParam
  ) {
    const data = await this.roleService.delete(idParam.id);

    return {
      data
    };
  }
}
