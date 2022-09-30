import * as mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

export const UserSchema = new mongoose.Schema(
  {
    full_name: String,
    name: String,
    password: { type: String },
    password_reset_token: String,
    password_reset_expired: Date,
    avatar: String,
    thumb_avatar: String,
    cover: String,
    thumb_cover: String,
    email: { type: String, unique: false, index: false },
    phone: String,
    role: { type: ObjectId, ref: 'Role' },
    status: String,
    time_expired_active: Date,
    code_active: String,
    time_expired_forget_password: Date,
    code_forget_password: String,
    is_forget_password: { type: Boolean, default: false },
    google: Object,
    facebook: Object,
    address: String,
    birthday: Date,
    facebook_url: String,
    zalo_url: String,
    linkedin_url: String,
    twitter_url: String,
    intro: String,
    view_count: { type: Number, default: 0 },
    experience: { type: Array },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

UserSchema.virtual('top_post', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'author',
  justOne: true,
  match: {
    status: true,
    active_chapter_count: { $gt: 0 },
    publish_status: 'published',
  },
  options: { sort: { view_count: -1 }, limit: 1 },
});

UserSchema.virtual('follow_count', {
  ref: 'FollowAuthor',
  localField: '_id',
  foreignField: 'author',
  count: true,
});

UserSchema.virtual('is_follow', {
  ref: 'FollowAuthor',
  localField: '_id',
  foreignField: 'author',
  justOne: true,
});

UserSchema.virtual('post_count', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'author',
  count: true,
});

UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });
