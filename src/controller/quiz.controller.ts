import { Response } from 'express';
import { TypeRequestBody } from '../types/request.types';

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

    const data = {
      question,
      topic,
      difficulty,
      answer,
      wrongOption1,
      wrongOption2,
      wrongOption3,
      detailedSolution,
    };

    return res.status(200).json({ message: 'OK', data });
  },
};

export default quizController;
