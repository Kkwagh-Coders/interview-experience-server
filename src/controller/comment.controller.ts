import { Request, Response } from 'express';

const commentController = {
  getComment: async (req: Request, res: Response) => {
    return res.status(200).json({ message: 'in get Comment' });
  },
  createComment: async (req: Request, res: Response) => {
    return res.status(200).json({ message: 'in createComment' });
  },
  deleteComment: async (req: Request, res: Response) => {
    return res.status(200).json({ message: 'in delete Comment' });
  },
  getCommentReplies: async (Req: Request, res: Response) => {
    return res.status(200).json({ message: 'in get nested Comment' });
  },
  createCommentReply: async (Req: Request, res: Response) => {
    return res.status(200).json({ message: 'in create nested comment' });
  },
};

export default commentController;
