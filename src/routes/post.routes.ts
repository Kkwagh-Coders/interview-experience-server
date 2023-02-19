import { Router } from 'express';
import postController from '../controller/post.controller';
import isUserAuth from '../middleware/isUserAuth';
import cookieDataParser from '../middleware/cookieDataParser';
const router = Router();

// TODO : finalize endpoints
router.get('', cookieDataParser, postController.getAllPost);
router.get('/:id', isUserAuth, postController.getPost);
router.get(
  '/bookmarked/user',
  isUserAuth,
  postController.getUserBookmarkedPost,
);
router.get('/user/all', isUserAuth, postController.getUserPost);
router.post('', isUserAuth, postController.createPost);
router.delete('/:id', isUserAuth, postController.deletePost);

router.post('/upvote/:id', isUserAuth, postController.upVotePost);
router.post('/downvote/:id', isUserAuth, postController.downVotePost);

router.post('/bookmark/:id', isUserAuth, postController.addUserBookmark);
router.delete('/bookmark/:id', isUserAuth, postController.removeUserBookmark);

export default router;
