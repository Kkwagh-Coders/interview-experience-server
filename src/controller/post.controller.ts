import { Request, Response } from 'express';
import { DeleteResult, ObjectId } from 'mongodb';
import { IPostList, IPostForm } from '../types/post.types';
import { TypeRequestBody } from '../types/request.types';
import { IAuthToken } from '../types/token.types';
import postServices from '../services/post.service';
import mongoose, { mongo, Types } from 'mongoose';

const postController = {
  // TODO: finalize function names
  getAllPost: async (req: Request, res: Response) => {
    return res.status(200).json({ message: 'in get Post' });
  },

  getPost: async (
    req: TypeRequestBody<{ authTokenData: IAuthToken }>,
    res: Response,
  ) => {
    const postId = req.params['id'];

    // check if the id is a valid mongodb id;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(404).json({ message: 'No such Post found' });
    }
    try {
      // increment the value of views by 1 and return the post with populated user data
      const post = await postServices.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: 'No such Post found' });
      }
      const postAuthor = post.userId.username;
      const postAuthorId = post.userId._id;

      // get the userid
      const userId = req.body.authTokenData.id;

      //check if the user has bookmarked the current post or not?
      const isBookmarked = post.bookmarks.includes(userId);

      // calculate vote count
      const voteCount = post.upVotes.length - post.downVotes.length;

      // check whether user has upvoted or downvoted the post
      const isUpvoted = post.upVotes.includes(userId);
      const isDownVoted = post.downVotes.includes(userId);
      const commentCount = post.comments.length;

      return res.status(200).json({
        message: 'post fetched successfully',
        post: {
          title: post.title,
          content: post.content,
          comapany: post.company,
          role: post.role,
          postType: post.postType,
          domain: post.domain,
          rating: post.rating,
          createdAt: post.createdAt,
          voteCount,
          views: post.views,
          tags: post.tags,
          postAuthorId,
          commentCount,
          isBookmarked,
          postAuthor,
          isUpvoted,
          isDownVoted,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: 'Something went wrong.....' });
    }
  },

  getUserBookmarkedPost: async (
    req: TypeRequestBody<{ authTokenData: IAuthToken }>,
    res: Response,
  ) => {
    const userId = req.body.authTokenData.id;

    // queryPage should start from 0
    const page: number = parseInt(req.query['page'] as string);
    let limit: number = parseInt(req.query['limit'] as string);

    if (!limit || limit > 20) {
      limit = 5;
    }

    if (!page && page != 0) {
      return res.status(404).json({ message: 'No such page found' });
    }

    const skip = limit * page;
    try {
      const response = await postServices.getUserBookmarkedPost(
        userId,
        limit,
        skip,
      );
      if (response.length === 0) {
        return res
          .status(200)
          .json({ message: 'No posts to display', data: [] });
      }

      // check whether user has upvoted or downvoted the post
      for (const i in response) {
        response[i].isUpvoted = false;
        response[i].isdownVoted = false;
        for (const index in response[i].upVotes) {
          if (userId == response[i].upVotes[index]) {
            response[i].isUpvoted = true;
            response[i].isdownVoted = false;
            break;
          }
        }
        if (response[i].isUpvoted === false) {
          for (const index in response[i].downVotes) {
            if (userId == response[i].downVotes[index]) {
              response[i].isUpvoted = false;
              response[i].isdownVoted = true;
              break;
            }
          }
        }

        response[i].upVotes = [];
        response[i].downVotes = [];
      }

      const nextPage = page + 1;
      const previousPage = page === 0 ? undefined : page - 1;
      return res.status(200).json({
        message: 'bookmarked posts fetched successfully',
        data: response,
        page: { nextPage, previousPage },
      });
    } catch (error) {
      return res.status(500).json({ message: 'Something went wrong.....' });
    }
  },

  getUserPost: async (req: Request, res: Response) => {
    return res.status(200).json({ message: 'in get user Post' });
  },
  createPost: async (
    req: TypeRequestBody<{
      title?: string;
      content?: string;
      company?: string;
      role?: string;
      postType?: string;
      domain?: string;
      rating?: number;
      status?: string;
      tags?: string[];
      authTokenData: IAuthToken;
    }>,
    res: Response,
  ) => {
    // Destructure
    const {
      title,
      content,
      company,
      role,
      postType,
      domain,
      rating,
      status,
      tags,
      authTokenData,
    } = req.body;

    // Check if user hahs passed all values
    if (
      !title ||
      !content ||
      !company ||
      !role ||
      !postType ||
      !domain ||
      !rating ||
      !status ||
      !tags
    ) {
      return res
        .status(401)
        .json({ message: 'Please enter all required fields ' });
    }

    const postData: IPostForm = {
      title,
      content,
      company,
      role,
      postType,
      domain,
      rating,
      status,
      tags,
      userId: authTokenData.id,
    };

    // Create post using the post services
    try {
      const post = await postServices.createPost(postData);
      return res
        .status(200)
        .json({ message: 'Post Created Successfully', postId: post._id });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong.....' });
    }

    // TODO: save the post in the user model in the userPost section
  },
  deletePost: async (
    req: TypeRequestBody<{
      authTokenData: IAuthToken;
    }>,
    res: Response,
  ) => {
    const { authTokenData } = req.body;
    const userId = authTokenData.id.toString();

    const postId = req.params['id'];
    if (!Types.ObjectId.isValid(postId)) {
      return res
        .status(404)
        .json({ message: 'Please provide a valid Post to Delete' });
    }

    let postDeleteResponse: DeleteResult | null = null;
    try {
      // If user is admin then direct delete the post
      // Else delete the post when both post and userId matches
      if (authTokenData.isAdmin) {
        postDeleteResponse = await postServices.deletePost(postId);
      } else {
        postDeleteResponse = await postServices.deletePostUsingAuthorId(
          postId,
          userId,
        );
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong...' });
    }

    // Check the conditions if the post is successfully deleted or not
    if (!postDeleteResponse.acknowledged) {
      return res.status(400).json({ message: 'Something went wrong...' });
    }

    if (postDeleteResponse.deletedCount === 0) {
      return res.status(404).json({ message: 'Post Could not be Delete' });
    }

    return res.status(200).json({ message: 'Post Deleted Successfully' });
  },
};

export default postController;
