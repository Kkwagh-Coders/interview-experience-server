import { Router } from 'express';
import userController from '../controller/user.controller';

const router = Router();

router.post('/login', userController.loginUser);
router.post('/register', userController.registerUser);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', userController.resetPassword);
// router.post('/logout', userController.logoutUser);

export default router;
