import postModel from '../models/post.model';
import {
  IPostForm,
  IPostDisplay,
  IPostList,
  IPostFilter,
  // IPostSort,
} from '../types/post.types';
import { Aggregate, Types } from 'mongoose';

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
        views: 0,
        status: 0,
      })
      .populate<IPostList>('userId', 'username')
      .limit(limit)
      .skip(skip)
      .lean();
  },
  getAllPosts: (
    filter: IPostFilter,
    sort: string,
    limit: number,
    skip: number,
  ) => {
    return postModel
      .find(filter)
      .sort(sort)
      .select({
        comments: 0,
        status: 0,
        tags: 0,
      })
      .populate<IPostList>('userId', 'username')
      .limit(limit)
      .skip(skip)
      .lean();
  },

  getUserPosts: (userId: Types.ObjectId, limit: number, skip: number) => {
    return postModel
      .find({ userId })
      .select({ comments: 0, tags: 0 })
      .populate<IPostList>('userId', 'username')
      .limit(limit)
      .skip(skip)
      .lean();
  },
  upVotePost: (postId: string, userId: string) => {
    const conditions = {
      _id: postId,
      upVotes: { $ne: userId },
    };

    // We are adding the upvote and also removing the user id from downvote if present
    const update = {
      $addToSet: { upVotes: userId },
      $pull: { downVotes: userId },
    };

    return postModel.updateOne(conditions, update);
  },
  downVotePost: (postId: string, userId: string) => {
    const conditions = {
      _id: postId,
      downVotes: { $ne: userId },
    };

    // We are adding the upvote and also removing the user id from downvote if present
    const update = {
      $addToSet: { downVotes: userId },
      $pull: { upVotes: userId },
    };

    return postModel.updateOne(conditions, update);
  },
  nullifyUserVote: (postId: string, userId: string) => {
    const condition = { _id: postId };

    // We are adding the upvote and also removing the user id from downvote if present
    const update = { $pull: { upVotes: userId, downVotes: userId } };

    return postModel.updateOne(condition, update);
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

  getCompanyAndRole: (): Aggregate<{ company: string[]; role: string[] }[]> => {
    return postModel.aggregate([
      {
        $group: {
          _id: null,
          company: { $addToSet: '$company' },
          role: { $addToSet: '$role' },
        },
      },
    ]);
  },

  editPost: (
    postId: string,
    userId: Types.ObjectId,
    editedPostData: IPostForm,
  ) => {
    return postModel.replaceOne(
      {
        _id: postId,
        userId,
      },
      editedPostData,
    );
  },
};

export default postServices;
