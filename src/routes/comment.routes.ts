import cors from 'cors';
import { Router } from 'express';
import corsOptionForCredentials from '../config/cors';
import commentController from '../controller/comment.controller';
import isUserAuth from '../middleware/isUserAuth';

const router = Router();

// TODO : finalize endpoints
router.get(
  '/:postid',
  cors(corsOptionForCredentials),
  isUserAuth,
  commentController.getComment,
);

router.post(
  '/:postid',
  cors(corsOptionForCredentials),
  isUserAuth,
  commentController.createComment,
);

router.delete(
  '/:postid/:commentid',
  cors(corsOptionForCredentials),
  isUserAuth,
  commentController.deleteComment,
);

// TODO: finalize endpoints
router.get(
  '/replies/:postid/:commentid',
  cors(corsOptionForCredentials),
  isUserAuth,
  commentController.getCommentReplies,
);
router.post(
  '/replies/:postid/:commentid',
  cors(corsOptionForCredentials),
  isUserAuth,
  commentController.createCommentReply,
);

router.delete(
  '/replies/:postid/:commentid/:replyid',
  cors(corsOptionForCredentials),
  isUserAuth,
  commentController.deleteCommentReply,
);
export default router;
