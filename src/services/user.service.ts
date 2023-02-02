import { Types } from 'mongoose';
import UserModel from '../models/user.model';

import { IUser } from '../types/user.types';

const userServices = {
  findUser: (email: string) => {
    return UserModel.findOne({ email });
  },

  createUser: (user: IUser) => {
    return UserModel.create(user);
  },

  deleteUser: (id: Types.ObjectId) => {
    return UserModel.deleteOne({ _id: id });
  },

  setResetFields: (
    email: string,
    update: { resetPasswordToken: string; resetPasswordExpiry: number },
  ) => {
    return UserModel.findOneAndUpdate({ email }, update);
  },

  unsetResetFields: (email: string) => {
    return UserModel.findByIdAndUpdate(
      { email },
      { resetPasswordToken: null, resetPasswordExpiry: null },
    );
  },

  findUserWithToken: (resetPasswordToken: string) => {
    return UserModel.findOne({
      resetPasswordToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });
  },

  resetPassword: (resetPasswordToken: string, newPassword: string) => {
    return UserModel.findOneAndUpdate(
      { resetPasswordToken },
      {
        password: newPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    );
  },
};

export default userServices;
