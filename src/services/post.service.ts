import postModel from '../models/post.model';
import { IPostForm, IPostDisplay, IPostList } from '../types/post.types';
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
    userId: Types.ObjectId,
    limit: number,
    skip: number,
  ) => {
    return postModel
      .find({ bookmarks: { $in: [userId] } })
      .select({
        comments: 0,
        tags: 0,
        rating: 0,
        bookmarks: 0,
        views: 0,
        status: 0,
      })
      .populate<IPostList>('userId', 'username')
      .limit(limit)
      .skip(skip)
      .lean();
  },
};

export default postServices;
