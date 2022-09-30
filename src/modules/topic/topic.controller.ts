import {Body, Controller, Delete, Param, Post, Put, Request, UseGuards, UsePipes, ValidationPipe} from '@nestjs/common';
import {ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiTags} from "@nestjs/swagger";
import {JwtAuthGuard} from "@/modules/auth/jwt-auth.guard";
import {DataTableParams} from "@/common/params/DataTableParams";
import {CreatePermission} from "@/modules/permission/dto/create-permission";
import {IdParam} from "@/common/params/IdParam";
import {EditPermission} from "@/modules/permission/dto/edit-permission";
import {TopicService} from "@/modules/topic/topic.service";
import {CreateTopic} from "@/modules/topic/dto/create-topic";
import {EditTopic} from "@/modules/topic/dto/edit-topic";

@ApiBearerAuth()
@ApiTags('Topic')
@Controller('topic')
export class TopicController {
    constructor(private topicService: TopicService) {}

    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ transform: true }))
    @Post('listing')
    async listForDatatable(
        @Request() req,
        @Body() datatableParams: DataTableParams,
    ) {
        const params = datatableParams.getDataTableParams();
        const listObj = await this.topicService.listing(
            false,
            params.keyword,
            params.start,
            params.length,
            params.orderBy,
            params.orderType,
        );
        const count = await this.topicService.listing(true, params.keyword);

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
        const listObj = await this.topicService.listing(
            false,
            datatableParams.search,
            datatableParams.page * 10,
            -1,
            'display_name',
            'asc',
        );
        const count = await this.topicService.listing(
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
    async add(@Request() req, @Body() createTopic: CreateTopic) {
        const data = await this.topicService.create(createTopic);

        return {
            data,
        };
    }

    @UseGuards(JwtAuthGuard)
    @ApiNoContentResponse()
    @Put(':id')
    async update(
        @Param() idParam: IdParam,
        @Body() editTopic: EditTopic,
    ) {
        const data = await this.topicService.update(
            idParam.id,
            editTopic,
        );

        return {
            data,
        };
    }

    @UseGuards(JwtAuthGuard)
    @ApiNoContentResponse()
    @Delete(':id')
    async delete(@Param() idParam: IdParam) {
        const data = await this.topicService.delete(idParam.id);

        return {
            data,
        };
    }
}