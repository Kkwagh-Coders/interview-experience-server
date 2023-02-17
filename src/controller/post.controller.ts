import { Request, Response } from 'express';
import { DeleteResult } from 'mongodb';
import { Types } from 'mongoose';
import postServices from '../services/post.service';
import { IPostForm } from '../types/post.types';
import { TypeRequestBody } from '../types/request.types';
import { IAuthToken } from '../types/token.types';

const postController = {
  // TODO: finalize function names
  getAllPost: async (req: Request, res: Response) => {
    return res.status(200).json({ message: 'in get Post' });
  },
  getDisplayPost: async (req: Request, res: Response) => {
    return res.status(200).json({ message: 'in get particular Post' });
  },
  getUserBookmarkedPost: async (req: Request, res: Response) => {
    return res.status(200).json({ message: 'in get user bookmarked Post' });
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
  addUserBookmark: async (
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
        .json({ message: 'Please provide a valid Post to Bookmark' });
    }

    try {
      const updateDetail = await postServices.addUserToBookmark(postId, userId);

      // Check if user was already bookmarked
      if (updateDetail.matchedCount === 0) {
        return res.status(500).json({ message: 'Post is already Bookmarked' });
      }

      console.log(updateDetail);
      return res.status(200).json({ message: 'Post Bookmarked Successfully' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong...' });
    }
  },
  removeUserBookmark: async (
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
        .json({ message: 'Please provide a valid Post to Remove Bookmark' });
    }

    try {
      const updateDetail = await postServices.removeUserFromBookmark(
        postId,
        userId,
      );

      // Check if user was already bookmarked
      if (updateDetail.matchedCount === 0) {
        return res.status(500).json({ message: 'Post is not Bookmarked' });
      }

      console.log(updateDetail);
      return res.status(200).json({ message: 'Post Removed From Bookmark' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong...' });
    }
  },
};

export default postController;
