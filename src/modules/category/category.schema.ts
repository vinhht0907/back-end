import * as mongoose from 'mongoose';

export const CategorySchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    description: String,
    featured_image: String,
    parent_type: String,
    seo_keywords: String,
    seo_description: String,
    status: Boolean,
    order: Number
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)
