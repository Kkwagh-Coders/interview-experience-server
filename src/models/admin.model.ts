import mongoose, { Schema } from 'mongoose';
import { IAdmin } from '../types/admin.types';

// admin model stores the data about admin
const adminSchema = new Schema<IAdmin>({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export default mongoose.model<IAdmin>('Admin', adminSchema);
