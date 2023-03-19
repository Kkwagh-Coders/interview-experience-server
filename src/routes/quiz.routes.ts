import { Router } from 'express';
import cors from 'cors';
import corsOptionForCredentials from '../config/cors';
import isUserAuth from '../middleware/isUserAuth';
import quizController from '../controller/quiz.controller';
import isAdminAuth from '../middleware/isAdminAuth';
const router = Router();

router.options('', cors(corsOptionForCredentials));
router.post(
  '',
  cors(corsOptionForCredentials),
  isAdminAuth,
  quizController.createQuestion,
);

router.options('', cors(corsOptionForCredentials));
router.get(
  '',
  cors(corsOptionForCredentials),
  isUserAuth,
  quizController.getQuizQuestion,
);

router.options('/submit', cors(corsOptionForCredentials));
router.post(
  '/submit',
  cors(corsOptionForCredentials),
  isUserAuth,
  quizController.submitQuiz,
);

router.options('/streak', cors(corsOptionForCredentials));
router.get(
  '/streak',
  cors(corsOptionForCredentials),
  isUserAuth,
  quizController.getStreak,
);

export default router;
