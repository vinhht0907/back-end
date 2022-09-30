import * as mongoose from 'mongoose';

export const TopicSchema = new mongoose.Schema(
  {
    name: String,
      link: String,
    description: String,
    resources: { type: mongoose.Types.ObjectId, ref: 'Resource', default: null },
    keywords: [{ type: mongoose.Types.ObjectId, ref: 'Keyword', default: [] }],
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
