import { Router } from 'express';
import cors from 'cors';
import corsOptionForCredentials from '../config/cors';
import isUserAuth from '../middleware/isUserAuth';
import quizController from '../controller/quiz.controller';
const router = Router();

router.post(
  '',
  cors(corsOptionForCredentials),
  isUserAuth,
  quizController.createQuestion,
);

router.get('', cors(corsOptionForCredentials), quizController.getQuizQuestion);
router.post(
  '/submit',
  cors(corsOptionForCredentials),
  isUserAuth,
  quizController.submitQuiz,
);
export default router;
