import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { IForgotPasswordToken } from '../../types/token.types';

const generateForgotPasswordToken = (
  id: Types.ObjectId,
  email: string,
  isAdmin: boolean,
) => {
  if (!process.env['SECRET_KEY']) {
    console.log('JWT key is undefined');
    throw new Error('JWT SECRET_KEY key not defined');
  }

  const tokenBody: IForgotPasswordToken = {
    id,
    email,
    isAdmin,
  };

  // Time the token is valid for
  const expiryTimeInSeconds = 10 * 60;

  const token = jwt.sign(tokenBody, process.env['SECRET_KEY'], {
    expiresIn: expiryTimeInSeconds,
  });

  if (!token) throw new Error('Could not generate forgot password token');
  return token;
};

export default generateForgotPasswordToken;
