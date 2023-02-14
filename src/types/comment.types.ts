import { Types } from 'mongoose';
import { IReply } from './reply.types';

export interface IComment {
  userid: Types.ObjectId;
  content: string;
  createdAt: Date;
  replies: [IReply];
}
