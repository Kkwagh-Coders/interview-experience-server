import { Types } from 'mongoose';

export interface IAuthToken {
  id: Types.ObjectId;
  email: string;
  isAdmin: boolean;
}
