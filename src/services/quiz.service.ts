import quizModel from '../models/quiz.model';
import { IQuiz } from '../types/quiz.types';

const quizServices = {
  createQuizQuestion: (question: IQuiz) => {
    return quizModel.create(question);
  },
};

export default quizServices;
