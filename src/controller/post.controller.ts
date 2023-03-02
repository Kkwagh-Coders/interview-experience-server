import { Request, Response } from 'express';
import { DeleteResult } from 'mongodb';
import { TypeRequestBody } from '../types/request.types';
import { IAuthToken } from '../types/token.types';
import postServices from '../services/post.service';
import mongoose, { Types } from 'mongoose';
import { IPostFilter, IPostForm } from '../types/post.types';
import generateTextFromHTML from '../utils/generateTextFromHTML';

const postController = {
  // TODO: finalize function names
  getAllPost: async (
    req: TypeRequestBody<{ userId: Types.ObjectId | null }>,
    res: Response,
  ) => {
    const { sortBy, articleType, jobRole, company, rating } = req.query;

    // Getting search from query and making sure it is string
    // If not then assigning it to empty string
    let search = req.query['search'];
    if (!search || typeof search !== 'string') {
      search = '';
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

    const skip = limit * page;
    const filters: IPostFilter = { $and: [{}, {}] };

    //default sorting is by newest post first
    let sort = '-createdAt';

    if (sortBy) {
      if (sortBy === 'new') sort = '-createdAt';
      else if (sortBy === 'old') sort = 'createdAt';
      else if (sortBy == 'views') sort = '-views';
      // else if (sortBy === 'top') sort.voteCount = 'desc';
    }

    // Adding search filter
    filters['$and'][0] = {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ],
    };

    // check and find all the filter parameters
    // if articleType is in query
    if (articleType) {
      filters['$and'][1].postType = articleType as string;
    }
    if (jobRole) {
      filters['$and'][1].role = jobRole as string;
    }
    if (company) {
      filters['$and'][1].company = company as string;
    }
    const convertedRating = parseInt(rating as string);
    if (convertedRating) filters['$and'][1].rating = convertedRating;

    try {
      const userId = req.body.userId;
      const posts = await postServices.getAllPosts(filters, sort, limit, skip);

      if (posts.length === 0) {
        return res.status(200).json({
          message: 'No posts to display',
          data: [],
          page: { previousPage: page === 0 ? undefined : page },
        });
      }

      // get the list of companies and roles
      const dataCompanyRole = await postServices.getCompanyAndRole();

      const response = posts.map((post) => {
        const { content, upVotes, downVotes, bookmarks } = post;
        const textContent = generateTextFromHTML(content);
        const isUpVoted = upVotes.some((id) => userId === id);
        const isDownVoted = !isUpVoted && downVotes.some((id) => userId === id);
        const isBookmarked = bookmarks.some((id) => userId === id);

        return {
          ...post,
          content: textContent,
          isUpVoted,
          isDownVoted,
          isBookmarked,
          votes: upVotes.length - downVotes.length,
          upVotes: undefined,
          downVotes: undefined,
          bookmarks: undefined,
        };
      });

      // as frontend is 1 based page index
      const nextPage = page + 2;
      // previous page is returned as page because for 1 based indexing page is the previous page as page-1 is done
      const previousPage = page === 0 ? undefined : page;
      return res.status(200).json({
        message: 'post fetched successfully',
        data: {
          data: response,
          company: dataCompanyRole[0].company,
          role: dataCompanyRole[0].role,
          page: { nextPage, previousPage },
        },
      });
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

      // get the userId
      const userId = req.body.authTokenData.id;

      //check if the user has bookmarked the current post or not?
      const isBookmarked = post.bookmarks.includes(userId);

      // calculate vote count
      const voteCount = post.upVotes.length - post.downVotes.length;

      // check whether user has upVoted or downVoted the post
      const isUpVoted = post.upVotes.includes(userId);
      const isDownVoted = post.downVotes.includes(userId);
      const commentCount = post.comments.length;

      return res.status(200).json({
        message: 'post fetched successfully',
        post: {
          title: post.title,
          content: post.content,
          company: post.company,
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
          isUpVoted,
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
    if (!limit || limit <= 0) limit = 10;

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
        return res.status(200).json({
          message: 'No posts to display',
          data: [],
          page: { previousPage: page === 0 ? undefined : page },
        });
      }

      const response = posts.map((post) => {
        const { upVotes, downVotes } = post;
        const isUpVoted = upVotes.some((id) => userId === id);
        const isDownVoted = !isUpVoted && downVotes.some((id) => userId === id);
        const isBookmarked = true;
        const textContent = generateTextFromHTML(post.content);

        return {
          ...post,
          content: textContent,
          isUpVoted,
          isDownVoted,
          isBookmarked,
          votes: upVotes.length - downVotes.length,
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

  getUserPost: async (
    req: TypeRequestBody<{ authTokenData: IAuthToken }>,
    res: Response,
  ) => {
    // query page will start from 1;
    let page = parseInt(req.query['page'] as string) - 1;
    let limit = parseInt(req.query['limit'] as string);

    // default limit
    if (!limit || limit <= 0) limit = 10;

    if (limit > 100) {
      return res.status(500).json({ message: 'limit cannot exceed 100' });
    }

    if (!page || page < 0) {
      page = 0;
    }

    const skip = limit * page;
    const userId = req.body.authTokenData.id;
    try {
      const posts = await postServices.getUserPosts(userId, limit, skip);

      if (posts.length === 0) {
        return res.status(200).json({
          message: 'No posts to display',
          data: [],
          page: { previousPage: page === 0 ? undefined : page },
        });
      }

      const response = posts.map((post) => {
        const { upVotes, downVotes, bookmarks } = post;
        const isUpVoted = upVotes.some((id) => id == userId);
        const isDownVoted = !isUpVoted && downVotes.some((id) => id == userId);
        const isBookmarked = bookmarks.some((id) => id == userId);
        const textContent = generateTextFromHTML(post.content);

        return {
          ...post,
          content: textContent,
          isUpVoted,
          isDownVoted,
          isBookmarked,
          votes: upVotes.length - downVotes.length,
          upVotes: undefined,
          downVotes: undefined,
          bookmarks: undefined,
        };
      });
      // as frontend is 1 based page index
      const nextPage = page + 2;
      // previous page is returned as page because for 1 based indexing page is the previous page as page-1 is done
      const previousPage = page === 0 ? undefined : page;
      return res.status(200).json({
        message: 'user posts',
        data: response,
        page: { nextPage, previousPage },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'something went wrong....' });
    }
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
  upVotePost: async (
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
        .json({ message: 'Please provide a valid Post to Up-Vote' });
    }

    try {
      const updateDetail = await postServices.upVotePost(postId, userId);

      // Check if user was already bookmarked
      if (updateDetail.matchedCount === 0) {
        await postServices.nullifyUserVote(postId, userId);
        return res
          .status(200)
          .json({ message: 'Removed Up Vote Successfully' });
      }

      return res.status(200).json({ message: 'Post Up Voted Successfully' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong...' });
    }
  },
  downVotePost: async (
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
        .json({ message: 'Please provide a valid Post to Down-Vote' });
    }

    try {
      const updateDetail = await postServices.downVotePost(postId, userId);

      // Check if user was already bookmarked
      if (updateDetail.matchedCount === 0) {
        await postServices.nullifyUserVote(postId, userId);
        return res
          .status(200)
          .json({ message: 'Removed Down Vote Successfully' });
      }

      return res.status(200).json({ message: 'Post Down Voted Successfully' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong...' });
    }
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

      return res.status(200).json({ message: 'Post Removed From Bookmark' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong...' });
    }
  },

  // to be called when the create post page is displayed
  getCompanyAndRole: async (req: Request, res: Response) => {
    try {
      const data = await postServices.getCompanyAndRole();
      return res.status(200).json({
        message: 'Company and role fetched successfully',
        data: {
          company: data[0].company,
          role: data[0].role,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong.....' });
    }
  },
};

export default postController;
