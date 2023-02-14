import { Router } from 'express';
import commentController from '../controller/comment.controller';
import isUserAuth from '../middleware/isUserAuth';

const router = Router();

// TODO : finalize endpoints
router.get('', isUserAuth, commentController.getComment);
router.post('/', isUserAuth, commentController.createComment);
router.delete('/', isUserAuth, commentController.deleteComment);

// TODO: nested comments or replies
router.get(
  '/nestedcomments/:postid/:commentid',
  isUserAuth,
  commentController.getNestedComments,
);
router.post(
  '/nestedcomments/:postid/:commentid',
  isUserAuth,
  commentController.createNestedComment,
);

export default router;
