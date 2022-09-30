import * as mongoose from 'mongoose';

export const MediaSchema = new mongoose.Schema(
  {
    name: String,
    hash: String,
    ext: String,
    size: Number,
    width: Number,
    height: Number,
    url: String,
    format: Object,
    webp: Object,
    blurhash: String,
    created_by: { ref: 'User', type: mongoose.Schema.Types.ObjectId },
    updated_by: { ref: 'User', type: mongoose.Schema.Types.ObjectId },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
