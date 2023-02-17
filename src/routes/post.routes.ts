import { Router } from 'express';
import postController from '../controller/post.controller';
import isUserAuth from '../middleware/isUserAuth';

const router = Router();

// TODO : finalize endpoints
router.get('', postController.getAllPost);
router.get('/:id', isUserAuth, postController.getDisplayPost);
router.get('/bookmarked', isUserAuth, postController.getUserBookmarkedPost);
router.get('/user', isUserAuth, postController.getUserPost);
router.post('', isUserAuth, postController.createPost);
router.delete('/:id', isUserAuth, postController.deletePost);

router.post('/bookmark/:id', isUserAuth, postController.addUserBookmark);
router.delete('/bookmark/:id', isUserAuth, postController.removeUserBookmark);

export default router;
