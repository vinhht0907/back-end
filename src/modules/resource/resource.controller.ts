import {Body, Controller, Delete, Param, Post, Put, Request, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiTags} from "@nestjs/swagger";
import {JwtAuthGuard} from "@/modules/auth/jwt-auth.guard";
import {DataTableParams} from "@/common/params/DataTableParams";
import {CreatePermission} from "@/modules/permission/dto/create-permission";
import {IdParam} from "@/common/params/IdParam";
import {EditPermission} from "@/modules/permission/dto/edit-permission";
import {ResourceService} from "@/modules/resource/resource.service";
import {CreateResource} from "@/modules/resource/dto/create-resource";
import {EditResource} from "@/modules/resource/dto/edit-resource";

@ApiBearerAuth()
@ApiTags('Resource')
@Controller('resource')
export class ResourceController {
    constructor(private resourceService: ResourceService) {}

    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('listing')
    async listForDatatable(
        @Request() req,
        @Body() datatableParams: DataTableParams,
    ) {
        const params = datatableParams.getDataTableParams();
        const listObj = await this.resourceService.listing(
            false,
            params.keyword,
            params.start,
            params.length,
            params.orderBy,
            params.orderType,
        );
        const count = await this.resourceService.listing(true, params.keyword);

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
        const listObj = await this.resourceService.listing(
            false,
            datatableParams.search,
            datatableParams.page * 10,
            -1,
            'name',
            'asc',
        );
        const count = await this.resourceService.listing(
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
    async add(@Request() req, @Body() createResource: CreateResource) {
        const data = await this.resourceService.create(createResource);

        return {
            data,
        };
    }

    @UseGuards(JwtAuthGuard)
    @ApiNoContentResponse()
    @Put(':id')
    async update(
        @Param() idParam: IdParam,
        @Body() editResource: EditResource,
    ) {
        const data = await this.resourceService.update(
            idParam.id,
            editResource,
        );

        return {
            data,
        };
    }

    @UseGuards(JwtAuthGuard)
    @ApiNoContentResponse()
    @Delete(':id')
    async delete(@Param() idParam: IdParam) {
        const data = await this.resourceService.delete(idParam.id);

        return {
            data,
        };
    }
}
