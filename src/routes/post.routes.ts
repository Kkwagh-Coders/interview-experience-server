import cors from 'cors';
import { Router } from 'express';
import corsOptionForCredentials from '../config/cors';
import postController from '../controller/post.controller';
import tokenDataParser from '../middleware/tokenDataParser';
import isUserAuth from '../middleware/isUserAuth';

const router = Router();

// TODO : finalize endpoints
router.options('', cors(corsOptionForCredentials));
router.get(
  '',
  cors(corsOptionForCredentials),
  tokenDataParser,
  postController.getAllPost,
);

router.options('/:id', cors(corsOptionForCredentials));
router.get(
  '/:id',
  cors(corsOptionForCredentials),
  isUserAuth,
  postController.getPost,
);

router.options('/user/bookmarked/:userId', cors(corsOptionForCredentials));
router.get(
  '/user/bookmarked/:userId',
  cors(corsOptionForCredentials),
  tokenDataParser,
  postController.getUserBookmarkedPost,
);

router.options('/related/:id', cors(corsOptionForCredentials));
router.get(
  '/related/:id',
  cors(corsOptionForCredentials),
  isUserAuth,
  postController.getRelatedPosts,
);

router.options('/user/all/:userId', cors(corsOptionForCredentials));
router.get(
  '/user/all/:userId',
  cors(corsOptionForCredentials),
  tokenDataParser,
  postController.getUserPost,
);

router.options('/data/company-roles', cors());
router.get('/data/company-roles', cors(), postController.getCompanyAndRole);

router.options('', cors(corsOptionForCredentials));
router.post(
  '',
  cors(corsOptionForCredentials),
  isUserAuth,
  postController.createPost,
);

router.options('/:id', cors(corsOptionForCredentials));
router.delete(
  '/:id',
  cors(corsOptionForCredentials),
  isUserAuth,
  postController.deletePost,
);

router.options('/upvote/:id', cors(corsOptionForCredentials));
router.post(
  '/upvote/:id',
  cors(corsOptionForCredentials),
  isUserAuth,
  postController.upVotePost,
);

router.options('/downvote/:id', cors(corsOptionForCredentials));
router.post(
  '/downvote/:id',
  cors(corsOptionForCredentials),
  isUserAuth,
  postController.downVotePost,
);

router.options('/bookmark/:id', cors(corsOptionForCredentials));
router.post(
  '/bookmark/:id',
  cors(corsOptionForCredentials),
  isUserAuth,
  postController.addUserBookmark,
);

router.options('/bookmark/:id', cors(corsOptionForCredentials));
router.delete(
  '/bookmark/:id',
  cors(corsOptionForCredentials),
  isUserAuth,
  postController.removeUserBookmark,
);

router.options('/edit', cors(corsOptionForCredentials));
router.put(
  '/edit',
  cors(corsOptionForCredentials),
  isUserAuth,
  postController.editPost,
);
export default router;
