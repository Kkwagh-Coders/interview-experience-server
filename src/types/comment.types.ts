import { Types } from 'mongoose';
import { IReply } from './reply.types';

export interface IComment {
  userId: Types.ObjectId;
  content: string;
  createdAt: Date;
  replies: IReply[];
}

export interface ICommentDisplay {
  userId: {
    _id: Types.ObjectId;
    username: string;
  };
  content: string;
  createdAt: Date;
}
