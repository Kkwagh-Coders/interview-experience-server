import { Request, Response } from 'express';
import { DeleteResult } from 'mongodb';
import { TypeRequestBody } from '../types/request.types';
import { IAuthToken } from '../types/token.types';
import postServices from '../services/post.service';
import mongoose, { Types } from 'mongoose';
import { IPostFilter, IPostForm } from '../types/post.types';

const postController = {
  // TODO: finalize function names
  getAllPost: async (
    req: TypeRequestBody<{ userId: Types.ObjectId | null }>,
    res: Response,
  ) => {
    const { sortBy, articleType, jobRole, company, rating, page, limit } =
      req.query;

    const filters: IPostFilter = {};

    //default sorting is by newest post first
    let sort = '-createdAt';

    if (sortBy) {
      if (sortBy === 'new') sort = '-createdAt';
      else if (sortBy === 'old') sort = 'createdAt';
      else if (sortBy == 'views') sort = '-views';
      // else if (sortBy === 'top') sort.voteCount = 'desc';
    }

    // check and find all the filter parameters
    // if articleType is in query
    if (articleType) {
      filters.postType = articleType as string;
    }
    if (jobRole) {
      filters.role = jobRole as string;
    }
    if (company) {
      filters.company = company as string;
    }
    const convertedRating = parseInt(rating as string);
    if (convertedRating) filters.rating = convertedRating;

    try {
      const userId = req.body.userId;
      const posts = await postServices.getAllPosts(filters, sort);

      const response = posts.map((post) => {
        const { upVotes, downVotes, bookmarks } = post;
        const isUpvoted = upVotes.some((id) => userId === id);
        const isDownvoted = !isUpvoted && downVotes.some((id) => userId === id);
        const isBookmarked = bookmarks.some((id) => userId === id);

        return {
          ...post,
          isUpvoted,
          isDownvoted,
          isBookmarked,
          upVotes: undefined,
          downVotes: undefined,
          bookmarks: undefined,
        };
      });

      return res.status(200).json({ message: 'in get Post', response });
    } catch (error) {
      return res.status(500).json({ message: 'Something went wrong.....' });
    }
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

    // queryPage should start from 1
    let page = parseInt(req.query['page'] as string) - 1;
    let limit = parseInt(req.query['limit'] as string);

    // default limit
    if (!limit) limit = 10;

    if (limit > 100) {
      return res.status(500).json({ message: 'Limit cannot exceed 100' });
    }

    // default page
    if (!page || page < 0) {
      page = 0;
    }

    const skip = limit * page;
    try {
      const posts = await postServices.getUserBookmarkedPost(
        userId,
        limit,
        skip,
      );
      if (posts.length === 0) {
        return res
          .status(200)
          .json({ message: 'No posts to display', data: [] });
      }

      const response = posts.map((post) => {
        const { upVotes, downVotes } = post;
        const isUpvoted = upVotes.some((id) => userId === id);
        const isDownvoted = !isUpvoted && downVotes.some((id) => userId === id);
        const isBookmarked = true;

        return {
          ...post,
          isUpvoted,
          isDownvoted,
          isBookmarked,
          upVotes: undefined,
          downVotes: undefined,
        };
      });

      // as frontend is 1 based page index
      const nextPage = page + 2;
      // previous page is returned as page because for 1 based indexing page is the previous page as page-1 is done
      const previousPage = page === 0 ? undefined : page;
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

    // Check if user has passed all values
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

    // Check the condition if the post is successfully deleted or not
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

// if (company && isNaN(company as number) )
//     if (articleType) {

//     }

//     if (jobRole) {
//     }

//     if (company) {
//     }
