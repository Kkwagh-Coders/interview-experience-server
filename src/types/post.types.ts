import { Types } from 'mongoose';
import { IComment } from './comment.types';

export interface IPost {
  title: string;
  content: string;
  userId: Types.ObjectId;
  company: string;
  role: string;
  postType: string;
  domain: string;
  rating: number;
  status: string;
  createdAt: Date;
  upVotes: Types.ObjectId[];
  downVotes: Types.ObjectId[];
  views: number;
  bookmarks: Types.ObjectId[];
  tags: string[];
  comments: IComment[];
}

export interface IPostForm {
  title: string;
  content: string;
  userId: Types.ObjectId;
  company: string;
  role: string;
  postType: string;
  domain: string;
  rating: number;
  status: string;
  tags: string[];
}
