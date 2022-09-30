import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { NotificationService } from '@/modules/notification/notification.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { PagingParams } from '@/common/params/PagingParams';
import { MarkRead } from '@/modules/notification/dto/mark-read';

@ApiTags('Notification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Post('list-all')
  async listAll(@Request() request, @Body() pagingParams: PagingParams) {
    const data = await this.notificationService.findAll(
      request.user.id,
      pagingParams,
    );

    return data;
  }

  @Post('mark-read')
  async markRead(@Request() request, @Body() markRead: MarkRead) {
    const data = await this.notificationService.markRead(
      request.user.id,
      markRead.notificationId,
    );

    return { data };
  }

  @Post('mark-read-all')
  async markReadAll(@Request() request) {
    const data = await this.notificationService.markReadAll(request.user.id);

    return { data };
  }
}
