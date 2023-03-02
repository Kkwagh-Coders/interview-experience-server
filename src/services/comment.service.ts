import { Types } from 'mongoose';
import postModel, { Comment, Reply } from '../models/post.model';

const commentServices = {
  getComment: async (postId: string, skip: number, limit: number) => {
    const selectedFields = {
      title: 0,
      content: 0,
      userId: 0,
      company: 0,
      role: 0,
      postType: 0,
      domain: 0,
      rating: 0,
      status: 0,
      createdAt: 0,
      upVotes: 0,
      downVotes: 0,
      views: 0,
      bookmarks: 0,
      tags: 0,
      'comments.replies': 0,
    };

    const post = await postModel
      .findById(postId)
      .select(selectedFields)
      .populate({
        path: 'comments',
        populate: { path: 'userId', select: 'username' },
        options: { sort: { createdAt: -1 } },
      });

    console.log(skip, skip + limit);
    console.log(
      post?.comments
        ?.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(skip, skip + limit),
    );
    return post?.comments
      ?.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(skip, skip + limit);
  },
  createComment: async (userId: string, postId: string, content: string) => {
    const comment = new Comment({ userId, content });

    // Define the condition and new value
    const conditions = { _id: postId };
    const update = { $addToSet: { comments: comment } };

    const post = await postModel.findOneAndUpdate(conditions, update);

    // Check if post is created or not, if created return the comment id
    if (!post) return null;
    return comment._id;
  },
  deleteComment: async (postId: string, commentId: string) => {
    const conditions = {
      _id: postId,
      comments: { $elemMatch: { _id: commentId } },
    };

    const update = { $pull: { comments: { _id: commentId } } };

    return postModel.updateOne(conditions, update);
  },
  deleteCommentUsingAuthorId: (
    postId: string,
    commentId: string,
    userId: string,
  ) => {
    const conditions = {
      _id: postId,
      comments: { $elemMatch: { _id: commentId, userId: userId } },
    };

    const update = { $pull: { comments: { _id: commentId } } };
    return postModel.updateOne(conditions, update);
  },
  getAllReplies: async (
    postId: string,
    commentId: string,
    limit: number,
    skip: number,
  ) => {
    // TODO: Have to optimize it such that pagination is done in Database itself
    const conditions = { _id: postId, 'comments._id': commentId };
    const parametersToGet = { _id: 0, 'comments.replies.$': 1 };

    const post = await postModel.findOne(conditions, parametersToGet).populate({
      path: 'comments.replies',
      populate: { path: 'userId', select: 'username' },
    });

    const replies = post?.comments[0].replies;
    if (!replies) return null;

    return replies
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(skip, skip + limit);
  },
  createReply: async (
    userId: string,
    postId: string,
    commentId: string,
    content: string,
  ) => {
    const reply = new Reply({ userId, content });

    // Define the condition and new value
    const conditions = {
      _id: postId,
      comments: { $elemMatch: { _id: commentId } },
    };

    const update = { $push: { 'comments.$.replies': reply } };

    const post = await postModel.findOneAndUpdate(conditions, update);

    // Check if post is updated or not, if updated return the comment id
    if (!post) return null;
    return reply._id;
  },
  deleteReply: (postId: string, commentId: string, replyId: string) => {
    const condition = {
      _id: postId,
      comments: {
        $elemMatch: {
          _id: commentId,
          replies: {
            $elemMatch: {
              _id: replyId,
            },
          },
        },
      },
    };

    const update = {
      $pull: { 'comments.$[].replies': { _id: replyId } },
    };

    return postModel.updateOne(condition, update);
  },
  deleteReplyUsingAuthorId: (
    postId: string,
    commentId: string,
    replyId: string,
    userId: Types.ObjectId,
  ) => {
    const condition = {
      _id: postId,
      comments: {
        $elemMatch: {
          _id: commentId,
          replies: {
            $elemMatch: {
              _id: replyId,
            },
          },
        },
      },
    };

    const update = {
      $pull: { 'comments.$[].replies': { _id: replyId, userId } },
    };

    return postModel.updateOne(condition, update);
  },
};

export default commentServices;
