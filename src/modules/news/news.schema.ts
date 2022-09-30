import * as mongoose from 'mongoose';

export const NewsSchema = new mongoose.Schema(
  {
    title: String,
    slug: String,
    description: String,
    content: String,
    category_type: String,
    seo_keyword: String,
    status: Boolean,
    author: { type: mongoose.Types.ObjectId, ref: 'User' },
    featured_image: { type: mongoose.Types.ObjectId, ref: 'Media' },
    tags: String,
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
