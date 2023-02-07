import { Router } from 'express';
import userController from '../controller/user.controller';
import isUserAuth from '../middleware/isUserAuth';

const router = Router();

router.post('/login', userController.loginUser);
router.get('/status', userController.getLoginStatus);
router.post('/register', userController.registerUser);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', userController.resetPassword);
router.post('/logout', userController.logoutUser);
router.get('/verify-email/:token', userController.verifyEmail);
router.delete('/', isUserAuth, userController.deleteUser);

export default router;
