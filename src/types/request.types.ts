import { Request } from 'express';

export interface TypeRequestBody<T> extends Request {
  body: T;
}
