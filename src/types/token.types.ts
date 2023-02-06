import { Types } from 'mongoose';

export interface IAuthToken {
  id: Types.ObjectId;
  email: string;
  isAdmin: boolean;
}

export interface IForgotPasswordToken {
  id: Types.ObjectId;
  email: string;
  isAdmin: boolean;
}

export interface IEmailVerificationToken {
  id: Types.ObjectId;
  email: string;
  isAdmin: boolean;
}
