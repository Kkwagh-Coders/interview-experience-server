import postModel, { Comment } from '../models/post.model';
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
};

export default commentServices;
