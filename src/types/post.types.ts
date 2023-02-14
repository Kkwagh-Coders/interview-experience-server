import { Types } from 'mongoose';
import { IComment } from './comment.types';

export interface IPost {
  title: string;
  content: string;
  userid: Types.ObjectId;
  company: string;
  role: string;
  postType: string;
  domain: string;
  rating: number;
  status: string;
  createdAt: Date;
  upVotes: [Types.ObjectId];
  downVotes: [Types.ObjectId];
  bookmarks: [Types.ObjectId];
  tags: [string];
  comments: [IComment];
}
