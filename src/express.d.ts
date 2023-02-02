import { IAuthToken } from './types/token.types';

declare global {
  namespace Express {
    interface Request {
      authTokenData?: IAuthToken;
    }
  }
}

export {};
