import * as mongoose from 'mongoose';

export const FaqSchema = new mongoose.Schema(
  {
    title: String,
    content: String,
    type: String,
    order: Number
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
