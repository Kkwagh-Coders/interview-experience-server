import mongoose, { Aggregate, Types } from 'mongoose';
import quizModel from '../models/quiz.model';
import quizHistoryModel from '../models/quizHistory.model';
import { IQuiz, IQuizHistorySubmit } from '../types/quiz.types';

const quizServices = {
  createQuizQuestion: (question: IQuiz) => {
    return quizModel.create(question);
  },

  getQuizQuestion: (topic: string, count: number): Aggregate<IQuiz[]> => {
    return quizModel.aggregate([
      { $match: { topic } },
      { $sample: { size: count } },
      { $project: { _id: 0, __v: 0 } },
    ]);
  },

  submitQuiz: (history: IQuizHistorySubmit) => {
    return quizHistoryModel.create(history);
  },

  getQuizHistoryDates: async (userId: string) => {
    const id = new Types.ObjectId(userId);
    const data = await quizHistoryModel.aggregate<{ _id: string }>([
      {
        $match: { userId: id },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: '%Y/%m/%d GMT',
              date: '$quizSubmitDate',
            },
          },
        },
      },
      {
        $group: {
          _id: '$date',
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    return data.map((item) => new Date(item._id));
  },
};

export default quizServices;
