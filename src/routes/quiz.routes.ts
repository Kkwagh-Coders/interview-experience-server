import { Router } from 'express';
import cors from 'cors';
import corsOptionForCredentials from '../config/cors';
import isUserAuth from '../middleware/isUserAuth';
import quizController from '../controller/quiz.controller';
import isAdminAuth from '../middleware/isAdminAuth';
const router = Router();

router.options('', cors(corsOptionForCredentials));
router.get(
  '',
  cors(corsOptionForCredentials),
  isUserAuth,
  quizController.getQuizQuestion,
);

router.options('/streak', cors());
router.get('/streak', cors(), quizController.getStreak);

router.options('', cors(corsOptionForCredentials));
router.post(
  '',
  cors(corsOptionForCredentials),
  isAdminAuth,
  quizController.createQuestion,
);

router.options('/submit', cors(corsOptionForCredentials));
router.post(
  '/submit',
  cors(corsOptionForCredentials),
  isUserAuth,
  quizController.submitQuiz,
);

export default router;
