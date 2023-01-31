import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Types } from 'mongoose';

dotenv.config();

const middleware = {
  generateToken: (email: string, id: Types.ObjectId) => {
    if (!process.env['SECRET_KEY']) {
      console.log('JWT key is undefined');
      return;
    }

    const token = jwt.sign({ email, id }, process.env['SECRET_KEY']);
    return token;
  },
};

export default middleware;
