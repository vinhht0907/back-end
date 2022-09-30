import * as mongoose from 'mongoose';

export const PermissionSchema = new mongoose.Schema(
  {
    name: String,
    display_name: String,
    description: String,
    roles: [{ type: mongoose.Types.ObjectId, ref: 'Role' }],
    status: Boolean,
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
)
