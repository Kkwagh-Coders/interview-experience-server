import { Router } from 'express';
import commentController from '../controller/comment.controller';
import isUserAuth from '../middleware/isUserAuth';

const router = Router();

// TODO : finalize endpoints
router.get('', isUserAuth, commentController.getComment);
router.post('/', isUserAuth, commentController.createComment);
router.delete('/', isUserAuth, commentController.deleteComment);

// TODO: nested comments or replies [Post id and comment id will be passed in search parameters and body]
router.get('/reply', isUserAuth, commentController.getCommentReplies);
router.post('/reply', isUserAuth, commentController.createCommentReply);

export default router;
