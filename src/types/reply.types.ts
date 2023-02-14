import { Types } from 'mongoose';

export interface IReply {
  userid: Types.ObjectId;
  content: string;
  createdAt: Date;
}
