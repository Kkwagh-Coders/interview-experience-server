import cors from 'cors';
import { Router } from 'express';
import postController from '../controller/post.controller';
import corsOptionForCredentials from '../config/cors';
import isUserAuth from '../middleware/isUserAuth';
import cookieDataParser from '../middleware/cookieDataParser';

const router = Router();

// TODO : finalize endpoints
router.get(
  '',
  cors(corsOptionForCredentials),
  cookieDataParser,
  postController.getAllPost,
);

router.get(
  '/:id',
  cors(corsOptionForCredentials),
  isUserAuth,
  postController.getPost,
);

router.get(
  '/bookmarked/user',
  cors(corsOptionForCredentials),
  isUserAuth,
  postController.getUserBookmarkedPost,
);

router.get(
  '/user/all',
  cors(corsOptionForCredentials),
  isUserAuth,
  postController.getUserPost,
);

router.post(
  '',
  cors(corsOptionForCredentials),
  isUserAuth,
  postController.createPost,
);

router.delete(
  '/:id',
  cors(corsOptionForCredentials),
  isUserAuth,
  postController.deletePost,
);

router.post(
  '/upvote/:id',
  cors(corsOptionForCredentials),
  isUserAuth,
  postController.upVotePost,
);

router.post(
  '/downvote/:id',
  cors(corsOptionForCredentials),
  isUserAuth,
  postController.downVotePost,
);

router.post(
  '/bookmark/:id',
  cors(corsOptionForCredentials),
  isUserAuth,
  postController.addUserBookmark,
);

router.delete(
  '/bookmark/:id',
  cors(corsOptionForCredentials),
  isUserAuth,
  postController.removeUserBookmark,
);

export default router;
