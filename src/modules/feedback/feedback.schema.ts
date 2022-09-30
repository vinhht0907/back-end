import * as mongoose from 'mongoose';

export const FeedbackSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    content: String,
    status: { type: String, default: 'unread' },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
