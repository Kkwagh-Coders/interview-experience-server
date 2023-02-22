import postModel, { Comment, Reply } from '../models/post.model';
import { ICommentDisplay } from '../types/comment.types';

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

    return post?.comments
      ?.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
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
};

export default commentServices;
