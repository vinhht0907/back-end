import * as mongoose from 'mongoose';

export const TagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true
    },
    slug: {
      type: String,
      unique: true
    },
    name_normalized: {
      type: String,
      unique: true
    },
    status: Boolean
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)
