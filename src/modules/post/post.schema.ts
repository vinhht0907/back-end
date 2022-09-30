import * as mongoose from 'mongoose';

export const PostSchema = new mongoose.Schema(
  {
    title: String,
    slug: String,
    description: String,
    content: String,
    categories: [{ type: mongoose.Types.ObjectId, ref: 'Category' }],
    category_type: String,
    audience: String,
    post_status: String, // ongoing - finished
    publish_status: String, // published - unpublished
    status: Boolean,
    tags: [{ type: mongoose.Types.ObjectId, ref: 'Tag' }],
    author: { type: mongoose.Types.ObjectId, ref: 'User' },
    note: String,
    active_chapter_count: { type: Number, default: 0 },
    view_count: { type: Number, default: 0 },
    comment_count: { type: Number, default: 0 },
    bookmark_count: { type: Number, default: 0 },
    review_count: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    ranking: { type: Number, default: 0 },
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

PostSchema.virtual('active_chapters', {
  ref: 'Chapter',
  localField: '_id',
  foreignField: 'post',
  justOne: false,
  options: { sort: { order: 1 } },
  match: { status: true },
});
