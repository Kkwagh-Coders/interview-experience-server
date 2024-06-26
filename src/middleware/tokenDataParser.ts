import { NextFunction, Request, Response } from 'express';
import { IAuthToken } from '../types/token.types';
import decodeToken from '../utils/token/decodeToken';

// A middleware to check if the user is authenticated or not, before any action
const tokenDataParser = (req: Request, res: Response, next: NextFunction) => {
  let token = req.headers['token'];

  if (Array.isArray(token)) {
    token = token[0];
  }

  if (!token) {
    req.body.userId = null;
    return next();
  }

  try {
    // Verify the token
    const authTokenData = decodeToken(token) as IAuthToken;

    // Adding token data to req
    req.body.userId = authTokenData.id;

    return next();
  } catch (err) {
    req.body.userId = null;
    return next();
  }
};

export default tokenDataParser;
