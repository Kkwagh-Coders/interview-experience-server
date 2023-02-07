import mongoose, { Schema } from 'mongoose';
import { IUser } from '../types/user.types';

// user model stores the data about user
const userSchema = new Schema<IUser>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, required: true },
  branch: { type: String, required: true },
  passingYear: { type: String, required: true },
  designation: { type: String, required: true },
  about: { type: String, required: true },
  github: { type: String, required: false },
  leetcode: { type: String, required: false },
  linkedin: { type: String, required: false },
});

export default mongoose.model<IUser>('User', userSchema);
