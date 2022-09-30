import * as mongoose from 'mongoose';

export const PageSchema = new mongoose.Schema(
  {
    title: String,
    slug: String,
    description: String,
    content: String,
    seo: String,
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
