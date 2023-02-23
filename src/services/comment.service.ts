import postModel, { Comment, Reply } from '../models/post.model';

const commentServices = {
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
