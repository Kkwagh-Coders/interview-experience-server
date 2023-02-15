import { Request, Response } from 'express';

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
  createPost: async (req: Request, res: Response) => {
    return res.status(200).json({ message: 'in createPost' });
  },
  deletePost: async (req: Request, res: Response) => {
    return res.status(200).json({ message: 'in delete Post' });
  },
};

export default postController;
