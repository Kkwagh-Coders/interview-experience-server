import { Types } from 'mongoose';
import { IReply } from './reply.types';

export interface IComment {
  userId: Types.ObjectId;
  content: string;
  createdAt: Date;
  replies: IReply[];
}
