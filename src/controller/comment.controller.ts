import { Request, Response } from 'express';
import { UpdateResult } from 'mongodb';
import { Types } from 'mongoose';
import commentServices from '../services/comment.service';
import { TypeRequestBody } from '../types/request.types';
import { IAuthToken } from '../types/token.types';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  SuccessResponse,
  UnauthorizedError,
} from '../utils/apiResponse';

const commentController = {
  getComment: async (
    req: TypeRequestBody<{ authTokenData: IAuthToken }>,
    res: Response,
  ) => {
    const postId = req.params['postid'];
    if (!Types.ObjectId.isValid(postId)) {
      return NotFoundError(res, { message: 'No such post found...' });
    }

    // query page = 0 for the backend that's why (-1)
    // query page = 1 for the frontend
    let page = parseInt(req.query['page'] as string) - 1;
    let limit = parseInt(req.query['limit'] as string);

    if (!limit || limit <= 0) limit = 10;
    if (limit > 100) {
      return InternalServerError(res, { message: 'Limit cannot exceed 100' });
    }

    if (!page || page < 0) {
      page = 0;
    }

    const skip = limit * page;

    try {
      const comments = await commentServices.getComment(postId, skip, limit);

      if (!comments || comments.length === 0) {
        return SuccessResponse(res, {
          message: 'No comments',
          data: [],
          page: {
            previousPage: page === 0 ? undefined : page,
            nextPage: undefined,
          },
        });
      }

      const previousPage = page === 0 ? undefined : page;
      const nextPage = page + 2;
      return SuccessResponse(res, {
        message: 'comments fetched successfully',
        data: comments,
        page: { nextPage, previousPage },
      });
    } catch (error) {
      console.log(error);
      return InternalServerError(res, { message: 'Something went wrong....' });
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
      return NotFoundError(res, {
        message: 'Please provide a valid post to create comment',
      });
    }

    if (!content) {
      return UnauthorizedError(res, {
        message: 'Comment is Empty, please provide content',
      });
    }

    try {
      const commentId = await commentServices.createComment(
        userId,
        postId,
        content,
      );

      if (!commentId) {
        return NotFoundError(res, {
          message: 'Please provide a valid Post to Comment',
        });
      }

      return SuccessResponse(res, {
        message: 'Comment Created Successfully',
        commentId: commentId,
      });
    } catch (error) {
      console.log(error);
      return InternalServerError(res, { message: 'Something went wrong.....' });
    }
  },
  deleteComment: async (req: Request, res: Response) => {
    const { authTokenData } = req.body;
    const userId = authTokenData.id.toString();

    const postId = req.params['postid'];
    const commentId = req.params['commentid'];
    if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(commentId)) {
      return NotFoundError(res, {
        message: 'Please provide a valid Comment to Delete',
      });
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
        return BadRequestError(res, { message: 'Something went wrong...' });
      }

      if (commentDeleteResponse.modifiedCount === 0) {
        return NotFoundError(res, { message: 'Comment Could not be Deleted' });
      }

      return SuccessResponse(res, { message: 'Comment Deleted Successfully' });
    } catch (error) {
      console.log(error);
      return InternalServerError(res, { message: 'Something went wrong...' });
    }
  },
  getCommentReplies: async (req: Request, res: Response) => {
    const postId = req.params['postid'];
    const commentId = req.params['commentid'];

    if (!Types.ObjectId.isValid(postId) || !Types.ObjectId.isValid(commentId)) {
      return NotFoundError(res, {
        message: 'Please provide a valid Post with Comment to reply',
      });
    }

    let page = parseInt(req.query['page'] as string) - 1;
    let limit = parseInt(req.query['limit'] as string);

    // default limit
    if (!limit || limit <= 0) limit = 10;

    if (limit > 100) {
      return InternalServerError(res, { message: 'Limit cannot exceed 100' });
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

      if (!replies || replies.length === 0) {
        return SuccessResponse(res, {
          message: 'No replies to display',
          data: [],
          page: {
            previousPage: page === 0 ? undefined : page,
            nextPage: undefined,
          },
        });
      }

      // as frontend is 1 based page index
      const nextPage = page + 2;

      // previous page is returned as page because for 1 based indexing page is the previous page as page-1 is done
      const previousPage = page === 0 ? undefined : page;

      return SuccessResponse(res, {
        message: 'Replies fetched successfully',
        data: replies,
        page: { nextPage, previousPage },
      });
    } catch (error) {
      console.log(error);
      return InternalServerError(res, { message: 'Something went wrong.....' });
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
      return NotFoundError(res, {
        message: 'Please provide a valid Post with Comment to reply',
      });
    }

    if (!content) {
      return UnauthorizedError(res, {
        message: 'Reply is Empty, please provide content',
      });
    }

    try {
      const replyId = await commentServices.createReply(
        userId,
        postId,
        commentId,
        content,
      );

      if (!replyId) {
        return NotFoundError(res, {
          message: 'Please provide a valid Comment to Reply',
        });
      }

      return SuccessResponse(res, {
        message: 'Replied to the Comment Successfully',
        replyId: replyId,
      });
    } catch (error) {
      console.log(error);
      return InternalServerError(res, { message: 'Something went wrong.....' });
    }
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
      return NotFoundError(res, {
        message: 'Please provide a valid Reply to be deleted....',
      });
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
        return InternalServerError(res, {
          message: 'something went wrong.....',
        });
      }

      if (!response.modifiedCount) {
        return NotFoundError(res, { message: 'no such reply found' });
      }

      return SuccessResponse(res, { message: 'Reply deleted successfully' });
    } catch (error) {
      console.log(error);
      return InternalServerError(res, { message: 'Something went wrong...' });
    }
  },
};

export default commentController;
