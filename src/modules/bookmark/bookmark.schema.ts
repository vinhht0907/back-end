import * as mongoose from 'mongoose';

export const BookmarkSchema = new mongoose.Schema(
  {
    user: {type: mongoose.Types.ObjectId, ref: 'User'},
    post: {type: mongoose.Types.ObjectId, ref: 'Post'},
    chapter: {type: mongoose.Types.ObjectId, ref: 'Chapter'},
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)
