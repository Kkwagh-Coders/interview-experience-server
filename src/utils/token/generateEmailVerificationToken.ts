import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { IEmailVerificationToken } from '../../types/token.types';

const generateEmailVerificationToken = (
  id: Types.ObjectId,
  email: string,
  isAdmin: boolean,
) => {
  if (!process.env['SECRET_KEY']) {
    console.log('JWT key is undefined');
    throw new Error('JWT SECRET_KEY key not defined');
  }

  const tokenBody: IEmailVerificationToken = {
    id,
    email,
    isAdmin,
  };

  const token = jwt.sign(tokenBody, process.env['SECRET_KEY']);

  if (!token) throw new Error('Could not generate forgot password token');
  return token;
};

export default generateEmailVerificationToken;
