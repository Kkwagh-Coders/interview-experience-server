import mongoose from 'mongoose';
import adminType from '../types/admin.types';

// admin model stores the data about admin
const adminSchema = new mongoose.Schema<adminType>({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

export default mongoose.model('Admin', adminSchema);
