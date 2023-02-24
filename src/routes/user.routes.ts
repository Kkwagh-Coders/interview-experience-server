import cors from 'cors';
import { Router } from 'express';
import corsOptionForCredentials from '../config/cors';
import userController from '../controller/user.controller';
import isUserAuth from '../middleware/isUserAuth';

const router = Router();

router.post('/login', cors(corsOptionForCredentials), userController.loginUser);

router.get(
  '/status',
  cors(corsOptionForCredentials),
  userController.getLoginStatus,
);

router.post(
  '/register',
  cors(corsOptionForCredentials),
  userController.registerUser,
);

router.post(
  '/forgot-password',
  cors(corsOptionForCredentials),
  userController.forgotPassword,
);

router.post('/reset-password/:token', cors(), userController.resetPassword);

router.post(
  '/logout',
  cors(corsOptionForCredentials),
  userController.logoutUser,
);

router.get('/verify-email/:token', cors(), userController.verifyEmail);

router.delete(
  '/',
  cors(corsOptionForCredentials),
  isUserAuth,
  userController.deleteUser,
);

export default router;
