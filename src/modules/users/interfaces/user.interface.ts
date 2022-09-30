import { Document } from 'mongoose';

export interface User extends Document {
  _id: string;
  email: string;
  status: string;
  password: string;
  fcm_token: Array<string>;
  current_course: string;
  current_lesson: string;
  current_course_obj: object;
  current_lesson_obj: object;
  school: string;
  class: string;
  full_name: string;
  name: string;
  avatar: string;
  thumb_avatar: string;
  cover: string;
  thumb_cover: string;
  role: string;
  time_expired_active: Date;
  code_active: string;
  time_expired_forget_password: Date;
  code_forget_password: string;
  is_forget_password: boolean;
  google: object;
  facebook: object;
  address: string;
  birthday: Date;
  facebook_url: string;
  zalo_url: string;
  linkedin_url: string;
  twitter_url: string;
  intro: string;
  experience: Array<object>;
}
