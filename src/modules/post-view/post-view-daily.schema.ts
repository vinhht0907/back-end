import * as mongoose from 'mongoose';

export const PostViewDailySchema = new mongoose.Schema(
  {
    post: { type: mongoose.Types.ObjectId, ref: 'Post' },
    author: { type: mongoose.Types.ObjectId, ref: 'User' },
    view_count: { type: Number, default: 0 },
    status: { type: Boolean },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
