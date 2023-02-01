import { Router } from 'express';
import userController from '../controller/user.controller';

const router = Router();

router.post('/login', userController.loginUser);
router.post('/register', userController.registerUser);
// router.post('/logout', userController.logoutUser);
// router.post('/forgot-password', userController.forgotPassword);

export default router;
