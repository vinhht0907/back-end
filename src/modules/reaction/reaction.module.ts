import { Module } from '@nestjs/common';
import { ReactionController } from './reaction.controller';
import { ReactionService } from './reaction.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ReactionSchema } from '@/modules/reaction/reaction.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Reaction', schema: ReactionSchema, collection: 'reactions' },
    ]),
  ],
  controllers: [ReactionController],
  providers: [ReactionService],
  exports: [ReactionService],
})
export class ReactionModule {}
