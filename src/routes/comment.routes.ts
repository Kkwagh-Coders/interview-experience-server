import { Router } from 'express';
import commentController from '../controller/comment.controller';
import isUserAuth from '../middleware/isUserAuth';

const router = Router();

// TODO : finalize endpoints
router.get('/:postid', isUserAuth, commentController.getComment);
router.post('/:postid', isUserAuth, commentController.createComment);
router.delete(
  '/:postid/:commentid',
  isUserAuth,
  commentController.deleteComment,
);

// TODO: finalize endpoints
router.get(
  '/replies/:postid/:commentid',
  isUserAuth,
  commentController.getCommentReplies,
);
router.post(
  '/replies/:postid/:commentid',
  isUserAuth,
  commentController.createCommentReply,
);

router.delete(
  '/replies/:postid/:commentid/:replyid',
  isUserAuth,
  commentController.deleteCommentReply,
);
export default router;
