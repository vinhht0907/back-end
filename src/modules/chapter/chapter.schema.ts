import * as mongoose from 'mongoose';

export const ChapterSchema = new mongoose.Schema(
  {
    title: String,
    slug: String,
    content: String,
    post: {type: mongoose.Types.ObjectId, ref: 'Post'},
    status: {type: Boolean, default: true},
    view_count: {type: Number, default: 0},
    comment_count: {type: Number, default: 0},
    bookmark_count: {type: Number, default: 0},
    author: {type: mongoose.Types.ObjectId, ref: 'User'},
    order: {type: Number, default: 0},
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)
