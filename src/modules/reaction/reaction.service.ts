import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reaction } from '@/modules/reaction/reaction.interface';
import reactionTypes from './reaction-types';
import { CreateReaction } from '@/modules/reaction/dto/CreateReaction';

@Injectable()
export class ReactionService {
  constructor(
    @InjectModel('Reaction') private reactionModel: Model<Reaction>,
  ) {}

  async addReaction(user, createReaction: CreateReaction) {
    try {
      await this.reactionModel.deleteMany({
        user: user._id,
        chapter: createReaction.chapter,
      });

      await this.reactionModel.create({
        user: user._id,
        post: createReaction.post,
        chapter: createReaction.chapter,
        reaction: createReaction.reaction,
      });

      return true;
    } catch (e) {
      console.log(e);
    }

    return false;
  }

  async removeReaction(user, chapterId) {
    try {
      await this.reactionModel.deleteMany({
        user: user._id,
        chapter: chapterId,
      });
    } catch (e) {
      console.log(e);
    }

    return false;
  }

  async getUserReaction(userId, chapterId) {
    try {
      const reaction = await this.reactionModel.findOne({
        chapter: chapterId,
        user: userId,
      });

      return reaction;
    } catch (e) {
      console.log(e);
    }

    return null;
  }

  async getReactionByChapter(chapterId) {
    const result = [];
    let first = null;
    let count = 0;

    try {
      first = await this.reactionModel
        .findOne({
          chapter: chapterId,
        })
        .populate(
          'user',
          '_id name full_name avatar thumb_avatar email google facebook',
        );

      for (const item of reactionTypes) {
        const total = await this.reactionModel.countDocuments({
          reaction: item,
          chapter: chapterId,
        });

        count += total;

        result.push({
          reaction: item,
          total: total,
        });
      }
    } catch (e) {
      console.log(e);
    }

    return {
      reactions: result,
      first: first,
      count: count,
    };
  }

  async getReactionByChapterAndType(chapterId, type = null) {
    try {
      const filter = { chapter: chapterId };

      if (type) {
        filter['reaction'] = type;
      }

      const count = await this.reactionModel.countDocuments(filter);

      const data = await this.reactionModel
        .find(filter)
        .populate(
          'user',
          '_id name full_name avatar thumb_avatar email google facebook',
        )
        .limit(10);

      return {
        data: data.map(item => item.user),
        count: count,
      };
    } catch (e) {
      console.log(e);
    }

    return {
      data: [],
      count: 0,
    };
  }
}
