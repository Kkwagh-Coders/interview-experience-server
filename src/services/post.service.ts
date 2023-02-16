import postModel from '../models/post.model';
import { IPostForm } from '../types/post.types';
import { IPostDisplay } from '../types/post.types';
import { Types } from 'mongoose';
const postServices = {
  createPost: (post: IPostForm) => {
    return postModel.create(post);
  },
  deletePost: (postId: string) => {
    return postModel.deleteOne({ _id: postId });
  },
  deletePostUsingAuthorId: (postId: string, userId: string) => {
    return postModel.deleteOne({ _id: postId, userId: userId });
  },
  getPost: (postId: string) => {
    return postModel
      .findByIdAndUpdate({ _id: postId }, { $inc: { views: 1 } }, { new: true })
      .populate<IPostDisplay>('userId', 'username');
  },
  getUserBookmarkedPost: (
    auserId: Types.ObjectId,
    limit: number,
    skip: number,
  ) => {
    return postModel
      .find({ bookmarks: { $in: [auserId] } })
      .limit(limit)
      .skip(skip);
  },
};

export default postServices;
