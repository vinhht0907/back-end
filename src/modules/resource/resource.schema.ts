import * as mongoose from 'mongoose';

export const ResourceSchema = new mongoose.Schema(
    {
        name: String,
        link: String,
        logo: String,
        username: String,
        password: String,
        topics: {type: mongoose.Types.ObjectId, ref: 'Topic' }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    }
)
