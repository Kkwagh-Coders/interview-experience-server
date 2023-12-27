import { Aggregate, Types } from 'mongoose';
import postModel from '../models/post.model';
import {
  IPostDisplay,
  IPostFilter,
  IPostForm,
  IPostList,
} from '../types/post.types';

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
  getRelatedPosts: async (postId: string, limit: number) => {
    // increment the value of views by 1 and return the post with populated user data
    const post = await postServices.getPost(postId);
    if (!post) {
      throw 'No Post Found with the Given ID';
    }

    const postList = await postModel
      .find({
        $and: [{ company: post.company }, { _id: { $ne: post._id } }],
      })
      .limit(limit)
      .select({
        _id: 1,
        title: 1,
      });

    if (postList.length === limit) return postList;

    // Find all the posts to exclude
    const excludePostIds = [post._id];
    for (let i = 0; i < postList.length; i++) {
      excludePostIds.push(postList[i]._id);
    }

    // Calculate the new limit
    limit -= postList.length;

    const relatedPostList = await postModel.aggregate([
      {
        $search: {
          index: 'RecommendPost',
          compound: {
            must: [
              {
                moreLikeThis: {
                  like: {
                    title: post.title,
                    content: post.content,
                    postType: post.postType,
                  },
                },
              },
            ],
            mustNot: [
              {
                in: {
                  path: '_id',
                  value: excludePostIds,
                },
              },
            ],
          },
        },
      },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          title: 1,
        },
      },
    ]);

    return postList.concat(relatedPostList);
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
    isEditorAdmin = false,
  ) => {
    let filter: { _id: string } | { _id: string; userId: Types.ObjectId } = {
      _id: postId,
    };

    if (!isEditorAdmin) {
      filter = { _id: postId, userId };
    }

    const update = {
      title: editedPostData.title,
      content: editedPostData.content,
      summary: editedPostData.summary,
      company: editedPostData.company,
      role: editedPostData.role,
      postType: editedPostData.postType,
      domain: editedPostData.domain,
      rating: editedPostData.rating,
      status: editedPostData.status,
      tags: editedPostData.tags,
    };

    return postModel.findOneAndUpdate(filter, update);
  },
};

export default postServices;
