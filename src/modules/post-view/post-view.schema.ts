import * as mongoose from 'mongoose';

export const PostViewSchema = new mongoose.Schema(
  {
    post: {type: mongoose.Types.ObjectId, ref: 'Post'},
    author: {type: mongoose.Types.ObjectId, ref: 'User'},
    chapter: {type: mongoose.Types.ObjectId, ref: 'Chapter'},
    user: {type: mongoose.Types.ObjectId, ref: 'User'},
    code: {type: String},
    ip: {type: String},
    user_agent: {type: String},
    status: {type: Boolean, default: false}
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
