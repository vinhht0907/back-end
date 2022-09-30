import * as mongoose from 'mongoose';

export const FollowAuthorSchema = new mongoose.Schema(
  {
    user: {type: mongoose.Types.ObjectId, ref: 'User'},
    author: {type: mongoose.Types.ObjectId, ref: 'User'},
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)
