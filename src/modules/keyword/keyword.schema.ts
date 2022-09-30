import * as mongoose from 'mongoose';

export const KeywordSchema = new mongoose.Schema(
    {
        name: String,
        topics: [{type: mongoose.Types.ObjectId, ref: 'Topic', default:[] }]
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    }
)
