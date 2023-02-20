import mongoose, { Schema, Types } from 'mongoose';
import { IPost } from '../types/post.types';
import { IComment } from '../types/comment.types';
import { IReply } from '../types/reply.types';

const replySchema = new Schema<IReply>({
  userId: { type: Schema.Types.ObjectId, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now() },
});

const commentSchema = new Schema<IComment>({
  userId: { type: Schema.Types.ObjectId, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now() },
  replies: [replySchema],
});

const postSchema = new Schema<IPost>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  company: { type: String, required: true },
  role: { type: String, required: true },
  postType: { type: String, required: true },
  domain: { type: String, required: true },
  rating: { type: Number, required: true },
  status: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  upVotes: [{ type: Types.ObjectId, ref: 'User' }],
  downVotes: [{ type: Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  bookmarks: [Schema.Types.ObjectId],
  tags: [String],
  comments: [commentSchema],
});

export const Reply = mongoose.model<IPost>('Reply', replySchema);
export const Comment = mongoose.model<IPost>('Comment', commentSchema);
export default mongoose.model<IPost>('Post', postSchema);
