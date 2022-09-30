import * as mongoose from 'mongoose';

export const CommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
    post: { type: mongoose.Types.ObjectId, ref: 'Post' },
    chapter: { type: mongoose.Types.ObjectId, ref: 'Chapter' },
    parent_comment: { type: mongoose.Types.ObjectId, ref: 'Comment' },
    content: String,
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

CommentSchema.virtual('child_comment', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parent_comment',
});

CommentSchema.virtual('child_comment_count', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parent_comment',
  count: true,
});
