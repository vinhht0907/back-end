import * as mongoose from 'mongoose';

export const ReviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    post: { type: mongoose.Types.ObjectId, ref: 'Post' },
    content: String,
    score: {type: Number, default: 0},
    vote: {type: Number, default: 0},
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

ReviewSchema.virtual('review', {
  ref: 'ReviewVote',
  localField: '_id',
  foreignField: 'review',
});

