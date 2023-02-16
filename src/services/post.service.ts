import postModel from '../models/post.model';
import { IPostForm } from '../types/post.types';
import { IPostDisplay } from '../types/post.types';

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
  getUserBookmarkedPost: (userId: string) => {
    return 'Hello World';
  },
};

export default postServices;
