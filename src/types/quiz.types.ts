import { Types } from 'mongoose';
export interface IQuiz {
  question: string;
  topic: string;
  difficulty: number;
  answer: string;
  wrongOption1: string;
  wrongOption2: string;
  wrongOption3: string;
  detailedSolution: string;
}

export interface IQuizHistory {
  userId: Types.ObjectId;
  correctAnswerCount: number;
  totalQuestionsCount: number;
  date: Date;
  topic: string;
}

export interface IQuizHistorySubmit {
  userId: Types.ObjectId;
  correctAnswerCount: number;
  totalQuestionsCount: number;
  topic: string;
}
