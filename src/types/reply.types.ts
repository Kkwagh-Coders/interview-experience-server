import { Types } from 'mongoose';

export interface IReply {
  userId: Types.ObjectId;
  content: string;
  createdAt: Date;
}
