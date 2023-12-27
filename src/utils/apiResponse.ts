import { Response } from 'express';

export const SuccessResponse = (res: Response, data: object) => {
  return res.status(200).json(data);
};

export const BadRequestError = (res: Response, data: object) => {
  return res.status(400).json(data);
};

export const UnauthorizedError = (res: Response, data: object) => {
  return res.status(401).json(data);
};

export const NotFoundError = (res: Response, data: object) => {
  return res.status(404).json(data);
};

export const PreconditionFailedError = (res: Response, data: object) => {
  return res.status(412).json(data);
};

export const InternalServerError = (res: Response, data: object) => {
  return res.status(500).json(data);
};
