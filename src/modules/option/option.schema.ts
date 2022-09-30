import * as mongoose from 'mongoose';

export const OptionSchema = new mongoose.Schema(
  {
    key: String,
    value: mongoose.Schema.Types.Mixed
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)
