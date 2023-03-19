import { Aggregate } from 'mongoose';
import quizModel from '../models/quiz.model';
import { IQuiz } from '../types/quiz.types';

const quizServices = {
  createQuizQuestion: (question: IQuiz) => {
    return quizModel.create(question);
  },

  getQuizQuestion: (topic: string, count: number): Aggregate<IQuiz[]> => {
    return quizModel.aggregate([
      { $match: { topic: topic } },
      { $sample: { size: count } },
      { $project: { _id: 0, __v: 0 } },
    ]);
  },
};

export default quizServices;
