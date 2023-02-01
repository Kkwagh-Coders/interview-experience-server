import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { IAuthToken } from '../types/token.types';

const generateToken = (id: Types.ObjectId, email: string, isAdmin: boolean) => {
  if (!process.env['SECRET_KEY']) {
    console.log('JWT key is undefined');
    return null;
  }

  const tokenBody: IAuthToken = {
    id,
    email,
    isAdmin,
  };

  const token = jwt.sign(tokenBody, process.env['SECRET_KEY']);
  return token;
};

export default generateToken;
