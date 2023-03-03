import cors from 'cors';
import { Router } from 'express';
import corsOptionForCredentials from '../config/cors';
import userController from '../controller/user.controller';
import isUserAuth from '../middleware/isUserAuth';

const router = Router();

router.options('/login', cors(corsOptionForCredentials));
router.post('/login', cors(corsOptionForCredentials), userController.loginUser);

router.options('/status', cors(corsOptionForCredentials));
router.get(
  '/status',
  cors(corsOptionForCredentials),
  userController.getLoginStatus,
);

router.options('/register', cors(corsOptionForCredentials));
router.post(
  '/register',
  cors(corsOptionForCredentials),
  userController.registerUser,
);

router.options('/profile', cors(corsOptionForCredentials));
router.put(
  '/profile',
  cors(corsOptionForCredentials),
  isUserAuth,
  userController.editUserProfile,
);

router.options('/profile/:id', cors(corsOptionForCredentials));
router.get(
  '/profile/:id',
  cors(corsOptionForCredentials),
  userController.getUserProfile,
);

router.options('/forgot-password', cors(corsOptionForCredentials));
router.post(
  '/forgot-password',
  cors(corsOptionForCredentials),
  userController.forgotPassword,
);

router.options('/reset-password/:token', cors());
router.post('/reset-password/:token', cors(), userController.resetPassword);

router.options('/logout', cors(corsOptionForCredentials));
router.post(
  '/logout',
  cors(corsOptionForCredentials),
  userController.logoutUser,
);

router.options('/verify-email/:token', cors());
router.get('/verify-email/:token', cors(), userController.verifyEmail);

router.options('/', cors(corsOptionForCredentials));
router.delete(
  '/',
  cors(corsOptionForCredentials),
  isUserAuth,
  userController.deleteUser,
);

router.options('/', cors(corsOptionForCredentials));
router.get(
  '/search/',
  cors(corsOptionForCredentials),
  userController.searchUser,
);

export default router;
