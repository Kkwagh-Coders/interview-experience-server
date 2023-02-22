import { Types } from 'mongoose';
import { ICommentDisplay } from '../types/comment.types';
import postModel, { Comment, Reply } from '../models/post.model';

const commentServices = {
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
  getComment: (postId: string, limit: number, skip: number) => {
    const selectedFields = {
      _id: 1,
      comments: { $slice: [skip, limit] },
    };

    return postModel
      .findById(postId)
      .select(selectedFields)
      .populate<ICommentDisplay>({
        path: 'comments',
        populate: { path: 'userId', select: 'username' },
      })
      .sort({ $natural: 1 });
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
};

export default commentServices;
