import postModel from '../models/post.model';
import { IPostForm } from '../types/post.types';

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
  addUserToBookmark: (postId: string, userId: string) => {
    // Condition is used to match the postId
    // and check if user should not be present in bookmark before addition
    const conditions = {
      _id: postId,
      bookmarks: { $ne: userId },
    };

    // The $addToSet is used to add the data to the array
    const update = { $addToSet: { bookmarks: userId } };

    return postModel.updateOne(conditions, update);
  },
  removeUserFromBookmark: (postId: string, userId: string) => {
    // Condition is used to match the postId
    // and check if user should be present in bookmark before removal
    const conditions = {
      _id: postId,
      bookmarks: userId,
    };

    // $pull is used to remove the userId from the bookmark list
    const update = { $pull: { bookmarks: userId } };

    return postModel.updateOne(conditions, update);
  },
};

export default postServices;
