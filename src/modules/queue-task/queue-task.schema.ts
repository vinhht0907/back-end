import * as mongoose from 'mongoose';

export const QueueTaskSchema = new mongoose.Schema(
  {
    queue_name: String,
    name: {
      type: String,
      index: { unique: true, sparse: true }
    },
    status: String,
    id: String,
    data: Object,
    error: Object,
    ip: String,
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)
