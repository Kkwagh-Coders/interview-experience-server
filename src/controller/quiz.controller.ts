import { Request, Response } from 'express';
import quizServices from '../services/quiz.service';
import { IQuiz, IQuizHistorySubmit } from '../types/quiz.types';
import { TypeRequestBody } from '../types/request.types';
import { IAuthToken } from '../types/token.types';
import { Types } from 'mongoose';

const quizController = {
  createQuestion: async (
    req: TypeRequestBody<{
      question: string;
      topic: string;
      difficulty: number;
      answer: string;
      wrongOption1: string;
      wrongOption2: string;
      wrongOption3: string;
      detailedSolution: string;
    }>,
    res: Response,
  ) => {
    // destructure
    const {
      question,
      topic,
      difficulty,
      answer,
      wrongOption1,
      wrongOption2,
      wrongOption3,
      detailedSolution,
    } = req.body;

    if (
      !question ||
      !topic ||
      !answer ||
      !wrongOption1 ||
      !wrongOption2 ||
      !wrongOption3 ||
      !detailedSolution
    ) {
      return res
        .status(401)
        .json({ message: 'Please enter all required fields ' });
    }

    if (!difficulty || difficulty <= 0 || difficulty > 10) {
      return res
        .status(401)
        .json({ message: 'Please enter all required fields ' });
    }

    const data: IQuiz = {
      question,
      topic,
      difficulty,
      answer,
      wrongOption1,
      wrongOption2,
      wrongOption3,
      detailedSolution,
    };

    try {
      const question = await quizServices.createQuizQuestion(data);
      return res
        .status(200)
        .json({ message: 'Question created successfully', data: question._id });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong.....' });
    }
  },

  getQuizQuestion: async (req: Request, res: Response) => {
    const topic = req.query['topic'] as string;

    // set default count;
    let count = 5;
    if (req.query['count']) {
      count = parseInt(req.query['count'] as string);
    }

    if (!topic) {
      return res.status(404).json({ message: 'No such quiz found' });
    }

    try {
      const questions = await quizServices.getQuizQuestion(topic, count);

      if (questions.length == 0) {
        return res.status(404).json({ message: 'No such quiz found' });
      }

      return res
        .status(200)
        .json({ message: 'questions fetched successfully', data: questions });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong.....' });
    }
  },

  submitQuiz: async (
    req: TypeRequestBody<{
      topic: string;
      totalQuestionsCount: number;
      correctAnswerCount: number;
      authTokenData: IAuthToken;
    }>,
    res: Response,
  ) => {
    const { topic, totalQuestionsCount, correctAnswerCount } = req.body;
    const userId = req.body.authTokenData.id;

    if (!topic) {
      return res.status(401).json({ message: 'Not a valid test submission' });
    }

    // check if the totalQuestionsCount contains a valid value or not.
    if (
      !totalQuestionsCount ||
      totalQuestionsCount < 0 ||
      totalQuestionsCount < correctAnswerCount
    ) {
      return res.status(401).json({ message: 'Not a valid test submission' });
    }

    // check if the correctAnswerCount contains a valid value or not.
    if (
      correctAnswerCount < 0 ||
      (!correctAnswerCount && correctAnswerCount != 0)
    ) {
      return res.status(401).json({ message: 'Not a valid test submission' });
    }

    const result = correctAnswerCount / totalQuestionsCount;
    if (result < 0.6) {
      return res
        .status(412)
        .json({ message: 'Score must me greater than 60%...' });
    }
    const history: IQuizHistorySubmit = {
      topic,
      totalQuestionsCount,
      correctAnswerCount,
      userId,
    };

    try {
      const response = await quizServices.submitQuiz(history);
      return res
        .status(200)
        .json({ message: 'Quiz submitted successfully', data: response._id });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong.....' });
    }
  },

  getStreak: async (req: Request, res: Response) => {
    const userId = req.query['userId'] as string;
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: 'No such user found!!' });
    }

    let dailyQuizDone = false;
    try {
      const quizSubmitDates = await quizServices.getQuizHistoryDates(userId);

      if (quizSubmitDates.length === 0) {
        return res.status(200).json({
          message: 'streak fetched successfully',
          streakCount: 0,
          dailyQuizDone,
        });
      }

      const temp = new Date();
      const currentDate = new Date(
        `${temp.getFullYear()}/${temp.getMonth() + 1}/${temp.getDate()} GMT`,
      );

      // checks latest quiz date
      if (
        currentDate.getTime() - quizSubmitDates[0].getTime() >=
        86400000 * 2
      ) {
        return res.status(200).json({
          message: 'streak fetched successfully',
          streakCount: 0,
          dailyQuizDone,
        });
      }

      // check if user has solved any quiz today
      if (currentDate.toDateString() === quizSubmitDates[0].toDateString()) {
        dailyQuizDone = true;
      }

      let streakCount = 1;
      for (let i = 1; i < quizSubmitDates.length; i++) {
        if (
          quizSubmitDates[i - 1].getTime() - quizSubmitDates[i].getTime() >=
          86400000 * 2
        ) {
          break;
        }
        streakCount++;
      }

      return res.status(200).json({
        message: 'streak fetched successfully',
        streakCount,
        dailyQuizDone,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong.....' });
    }
  },
};

export default quizController;
