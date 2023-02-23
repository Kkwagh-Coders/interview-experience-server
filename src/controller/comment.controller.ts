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
  getCommentReplies: async (req: Request, res: Response) => {
    const postId = req.params['postid'];
    const commentId = req.params['commentid'];

    if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(commentId)) {
      return res
        .status(404)
        .json({ message: 'Please provide a valid Post with Comment to reply' });
    }

    let page = parseInt(req.query['page'] as string) - 1;
    let limit = parseInt(req.query['limit'] as string);

    // default limit
    if (!limit || limit <= 0) limit = 10;

    if (limit > 100) {
      return res.status(500).json({ message: 'Limit cannot exceed 100' });
    }

    // default page
    if (!page || page < 0) {
      page = 0;
    }

    try {
      // Calculate the total number of pages to skip
      const skip = limit * page;

      const replies = await commentServices.getAllReplies(
        postId,
        commentId,
        limit,
        skip,
      );

      if (!replies) {
        return res
          .status(200)
          .json({ message: 'No replies to display', data: [] });
      }

      // as frontend is 1 based page index
      const nextPage = page + 2;

      // previous page is returned as page because for 1 based indexing page is the previous page as page-1 is done
      const previousPage = page === 0 ? undefined : page;

      return res.status(200).json({
        message: 'Replies fetched successfully',
        data: replies,
        page: { nextPage, previousPage },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong.....' });
    }
  },
  createCommentReply: async (
    req: TypeRequestBody<{
      content?: string;
      authTokenData: IAuthToken;
    }>,
    res: Response,
  ) => {
    const { content, authTokenData } = req.body;
    const userId = authTokenData.id.toString();

    const postId = req.params['postid'];
    const commentId = req.params['commentid'];
    if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(commentId)) {
      return res
        .status(404)
        .json({ message: 'Please provide a valid Post with Comment to reply' });
    }

    if (!content) {
      return res
        .status(401)
        .json({ message: 'Reply is Empty, please provide content' });
    }

    try {
      const replyId = await commentServices.createReply(
        userId,
        postId,
        commentId,
        content,
      );

      if (!replyId) {
        return res
          .status(404)
          .json({ message: 'Please provide a valid Comment to Reply' });
      }

      return res.status(200).json({
        message: 'Replied to the Comment Successfully',
        replyId: replyId,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong.....' });
    }
  },
  deleteCommentReply: async (Req: Request, res: Response) => {
    return res.status(200).json({ message: 'in create nested comment' });
  },
};

export default commentController;
