import { NextFunction, Request, Response } from 'express';
import { IAuthToken } from '../types/token.types';
import { UnauthorizedError } from '../utils/apiResponse';
import decodeToken from '../utils/token/decodeToken';

// A middleware to check if the user is authenticated or not, before any action
const isUserAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies['token'];

  if (!token) {
    return UnauthorizedError(res, { message: 'User not LoggedIn' });
  }

  try {
    // Verify the token
    const authTokenData = decodeToken(token) as IAuthToken;

    // Adding token data to req
    req.body.authTokenData = authTokenData;

    return next();
  } catch (err) {
    return UnauthorizedError(res, { message: 'User not LoggedIn' });
  }
};

export default isUserAuth;
