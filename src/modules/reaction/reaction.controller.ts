import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ReactionService } from '@/modules/reaction/reaction.service';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { CreateReaction } from '@/modules/reaction/dto/CreateReaction';
import { RemoveReaction } from '@/modules/reaction/dto/RemoveReaction';
import { ReactionId } from '@/modules/reaction/dto/ReactionId';
import { GetReactionList } from '@/modules/reaction/dto/GetReactionList';

@ApiTags('Reaction')
@Controller('reaction')
export class ReactionController {
  constructor(private reactionService: ReactionService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse()
  @Post('add-reaction')
  async addReaction(@Request() req, @Body() createReaction: CreateReaction) {
    const data = await this.reactionService.addReaction(
      req.user,
      createReaction,
    );

    return {
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse()
  @Post('remove-reaction')
  async removeReaction(@Request() req, @Body() removeReaction: RemoveReaction) {
    const data = await this.reactionService.removeReaction(
      req.user,
      removeReaction.chapter,
    );

    return {
      data,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiCreatedResponse()
  @Post('get-user-reaction')
  async getUserReaction(@Request() req) {
    const data = await this.reactionService.getUserReaction(
      req.user._id,
      req.body.chapter_id,
    );

    return {
      data,
    };
  }

  @Post('get-reaction')
  async getReaction(@Request() req, @Body() reactionId: ReactionId) {
    const data = await this.reactionService.getReactionByChapter(
      reactionId.chapter,
    );

    return {
      data,
    };
  }

  @Post('get-reaction-list')
  async getReactionList(
    @Request() req,
    @Body() getReactionList: GetReactionList,
  ) {
    const data = await this.reactionService.getReactionByChapterAndType(
      getReactionList.chapter,
      getReactionList.reaction,
    );

    return data;
  }
}
