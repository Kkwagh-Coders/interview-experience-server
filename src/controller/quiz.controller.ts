import { Response } from 'express';
import quizServices from '../services/quiz.service';
import { IQuiz } from '../types/quiz.types';
import { TypeRequestBody } from '../types/request.types';
import { IAuthToken } from '../types/token.types';

const quizController = {
  createQuestion: async (
    req: TypeRequestBody<{
      question: string;
      topic: string;
      difficulty: string;
      answer: string;
      wrongOption1: string;
      wrongOption2: string;
      wrongOption3: string;
      detailedSolution: string;
      authTokenData: IAuthToken;
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
      authTokenData,
    } = req.body;

    if (
      !question ||
      !topic ||
      !difficulty ||
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

    // if not admin
    if (!authTokenData.isAdmin) {
      return res
        .status(403)
        .json({ message: 'Only admin can create a question' });
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
        .status(404)
        .json({ message: 'Question created successfully', data: question._id });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong.....' });
    }
  },

  getQuizQuestion: async (
    req: TypeRequestBody<{
      topic: string;
      count: string;
    }>,
    res: Response,
  ) => {
    const { topic } = req.body;
    let count = parseInt(req.body.count);

    if (!topic) {
      return res.status(404).json({ message: 'No such quiz found' });
    }

    // set default count;
    if (!count) count = 5;

    try {
      const questions = await quizServices.getQuizQuestion(topic, count);
      return res
        .status(200)
        .json({ message: 'questions fetch successfully', data: questions });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong.....' });
    }
  },
};

export default quizController;
