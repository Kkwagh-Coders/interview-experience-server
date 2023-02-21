import { Request, Response } from 'express';
import { UpdateResult } from 'mongodb';
import { Types } from 'mongoose';
import commentServices from '../services/comment.service';
import { TypeRequestBody } from '../types/request.types';
import { IAuthToken } from '../types/token.types';

const commentController = {
  getComment: async (
    req: TypeRequestBody<{ authTokenData: IAuthToken }>,
    res: Response,
  ) => {
    const postId = req.params['postid'];
    if (!Types.ObjectId.isValid(postId)) {
      return res.status(404).json({ message: 'No such post found...' });
    }

    // query page = 0 for the backend that's why (-1)
    // query page = 1 for the frontend
    let page = parseInt(req.query['page'] as string) - 1;
    let limit = parseInt(req.query['limit'] as string);

    if (!limit || limit <= 0) limit = 10;
    if (limit > 100) {
      return res.status(500).json({ message: 'Limit cannot exceed 100' });
    }

    if (!page || page < 0) {
      page = 0;
    }

    const skip = limit * page;

    try {
      const response = await commentServices.getComment(postId, limit, skip);
      if (!response) {
        return res.status(200).json({ message: 'No such Post found' });
      }
      if (response.comments.length == 0) {
        return res.status(200).json({ message: 'No comments', data: [] });
      }

      const previousPage = page === 0 ? undefined : page;
      const nextPage = page + 2;
      return res.status(200).json({
        message: 'comments fetched successfully',
        data: response.comments,
        page: { nextPage, previousPage },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong....' });
    }
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
  deleteCommentReply: async (
    req: TypeRequestBody<{ authTokenData: IAuthToken }>,
    res: Response,
  ) => {
    const userId = req.body.authTokenData.id;
    const postId = req.params['postid'];
    const commentId = req.params['commentid'];
    const replyId = req.params['replyid'];

    if (
      !Types.ObjectId.isValid(postId) ||
      !Types.ObjectId.isValid(commentId) ||
      !Types.ObjectId.isValid(replyId)
    ) {
      return res
        .status(404)
        .json({ message: 'Please provide a valid Reply to be deleted....' });
    }

    try {
      // if admin is trying to delete
      let response: UpdateResult | null = null;
      if (req.body.authTokenData.isAdmin) {
        response = await commentServices.deleteReply(
          postId,
          commentId,
          replyId,
        );
      } else {
        response = await commentServices.deleteReplyUsingAuthorId(
          postId,
          commentId,
          replyId,
          userId,
        );
      }

      if (!response.acknowledged) {
        return res.status(500).json({ message: 'something went wrong.....' });
      }

      if (!response.modifiedCount) {
        return res.status(404).json({ message: 'no such reply found' });
      }

      return res.status(200).json({ message: 'Reply deleted successfully' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong...' });
    }
  },
};

export default commentController;
