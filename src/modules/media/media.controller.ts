import {
  Body,
  Controller,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SearchParams } from '@/modules/media/dto/SearchParams';
import { Permission } from '@/modules/auth/permission.decorator';
import { MEDIA_MANAGE } from '@/common/constants/permissions';

@ApiBearerAuth()
@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload-single-image')
  async uploadSingleImage(@Req() request, @Res() response) {
    try {
      await this.mediaService.uploadSingleImage(request, response);
    } catch (error) {
      return response.status(500).json(`Failed to upload image file`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-editor-image')
  async uploadEditorImage(@Req() request, @Res() response) {
    try {
      await this.mediaService.uploadEditorImage(request, response);
    } catch (error) {
      return response.status(500).json({
        error: {
          message: 'error',
        },
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-single-file')
  async uploadSingleFile(@Req() request, @Res() response) {
    try {
      await this.mediaService.uploadSingleFile(request, response);
    } catch (error) {
      return response.status(500).json(`Failed to upload file`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-avatar')
  async uploadAvatar(@Req() request, @Res() response) {
    try {
      await this.mediaService.uploadAvatar(request, response);
    } catch (error) {
      return response.status(500).json(`Failed to upload image file`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-cover')
  async uploadCover(@Req() request, @Res() response) {
    try {
      await this.mediaService.uploadCover(request, response);
    } catch (error) {
      return response.status(500).json(`Failed to upload image file`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-multi-size')
  async uploadMultiSize(@Req() request, @Res() response) {
    try {
      await this.mediaService.uploadMultiSize(request, response);
    } catch (error) {
      return response.status(500).json({
        uploaded: false,
        error: {
          message: 'error',
        },
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-multi-size-editor')
  async uploadMultiSizeEditor(@Req() request, @Res() response) {
    try {
      await this.mediaService.uploadMultiSize(request, response, true);
    } catch (error) {
      return response.status(500).json({
        uploaded: false,
        error: {
          message: 'error',
        },
      });
    }
  }

  @Permission(MEDIA_MANAGE)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('listing')
  async getProfile(@Request() req, @Body() searchParams: SearchParams) {
    const data = await this.mediaService.listing(
      false,
      searchParams.keyword,
      searchParams.page * searchParams.length,
      searchParams.length,
      searchParams.orderBy,
      searchParams.orderType,
    );
    const count = await this.mediaService.listing(true, searchParams.keyword);

    return {
      count,
      data,
    };
  }
}
