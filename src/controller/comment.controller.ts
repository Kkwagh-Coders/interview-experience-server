import { Request, Response } from 'express';
import { UpdateResult } from 'mongodb';
import { Types } from 'mongoose';
import commentServices from '../services/comment.service';
import { TypeRequestBody } from '../types/request.types';
import { IAuthToken } from '../types/token.types';

const commentController = {
  getComment: async (req: Request, res: Response) => {
    return res.status(200).json({ message: 'in get Comment' });
  },
  createComment: async (
    req: TypeRequestBody<{
      content?: string;
      authTokenData: IAuthToken;
    }>,
    res: Response,
  ) => {
    const { content, authTokenData } = req.body;
    const userId = authTokenData.id.toString();

    const postId = req.params['postid'];
    if (!Types.ObjectId.isValid(postId)) {
      return res
        .status(404)
        .json({ message: 'Please provide a valid post to create comment' });
    }

    if (!content) {
      return res
        .status(401)
        .json({ message: 'Comment is Empty, please provide content' });
    }

    try {
      const commentId = await commentServices.createComment(
        userId,
        postId,
        content,
      );

      if (!commentId) {
        return res
          .status(404)
          .json({ message: 'Please provide a valid Post to Comment' });
      }

      return res.status(200).json({
        message: 'Comment Created Successfully',
        commentId: commentId,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong.....' });
    }
  },
  deleteComment: async (req: Request, res: Response) => {
    const { authTokenData } = req.body;
    const userId = authTokenData.id.toString();

    const postId = req.params['postid'];
    const commentId = req.params['commentid'];
    if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(commentId)) {
      return res
        .status(404)
        .json({ message: 'Please provide a valid Comment to Delete' });
    }

    try {
      let commentDeleteResponse: UpdateResult | null = null;

      // Check if the user is admin or not
      if (authTokenData.isAdmin) {
        commentDeleteResponse = await commentServices.deleteComment(
          postId,
          commentId,
        );
      } else {
        commentDeleteResponse =
          await commentServices.deleteCommentUsingAuthorId(
            postId,
            commentId,
            userId,
          );
      }

      // Check the condition if the given comment was successfully deleted or not
      if (!commentDeleteResponse.acknowledged) {
        return res.status(400).json({ message: 'Something went wrong...' });
      }

      if (commentDeleteResponse.modifiedCount === 0) {
        return res
          .status(404)
          .json({ message: 'Comment Could not be Deleted' });
      }

      return res.status(200).json({ message: 'Comment Deleted Successfully' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong...' });
    }
  },
  getCommentReplies: async (Req: Request, res: Response) => {
    return res.status(200).json({ message: 'in get nested Comment' });
  },
  createCommentReply: async (Req: Request, res: Response) => {
    return res.status(200).json({ message: 'in create nested comment' });
  },
  deleteCommentReply: async (Req: Request, res: Response) => {
    return res.status(200).json({ message: 'in create nested comment' });
  },
};

export default commentController;
