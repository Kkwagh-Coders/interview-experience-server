import mongoose, { Schema } from 'mongoose';
import { IQuizHistory } from '../types/quiz.types';

const quizHistorySchema = new Schema<IQuizHistory>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  correctAnswerCount: { type: Number, required: true },
  totalQuestionsCount: { type: Number, required: true },
  quizSubmitDate: { type: Date, default: Date.now },
  topic: { type: String, required: true },
});

export default mongoose.model<IQuizHistory>('QuizHistory', quizHistorySchema);
