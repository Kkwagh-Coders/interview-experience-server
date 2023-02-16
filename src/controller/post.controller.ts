import { Request, Response } from 'express';
import { IPostForm } from '../types/post.types';
import { TypeRequestBody } from '../types/request.types';
import { IAuthToken } from '../types/token.types';
import postServices from '../services/post.service';

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
  deletePost: async (req: Request, res: Response) => {
    return res.status(200).json({ message: 'in delete Post' });
  },
};

export default postController;
