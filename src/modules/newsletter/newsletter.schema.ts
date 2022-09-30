import * as mongoose from 'mongoose';

export const NewsLetterSchema = new mongoose.Schema(
  {
    email: String,
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
