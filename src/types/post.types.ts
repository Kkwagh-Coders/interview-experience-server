import { Types } from 'mongoose';
import { IComment } from './comment.types';

// for model
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

// for the create post
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

// for complete post display
export interface IPostDisplay {
  title: string;
  content: string;
  userId: {
    _id: Types.ObjectId;
    username: string;
  };
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

// for post list display
export interface IPostList {
  title: string;
  content: string;
  userId: {
    _id: Types.ObjectId;
    username: string;
  };
  company: string;
  role: string;
  postType: string;
  domain: string;
  createdAt: Date;
  upVotes: Types.ObjectId[];
  downVotes: Types.ObjectId[];
  isUpvoted: boolean;
  isdownVoted: boolean;
  isBookmarked: boolean;
}

export interface IPostFilter {
  createAt?: number;
  role?: string;
  postType?: string;
  company?: string;
  rating?: number;
  top?: number;
}
