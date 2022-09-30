import * as mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

export const RoleSchema = new mongoose.Schema(
  {
    name: String,
    display_name: String,
    description: String,
    permissions: [{ type: ObjectId, ref: 'Permission' }],
    status: Boolean,
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
)
