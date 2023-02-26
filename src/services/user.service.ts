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

  resetPassword: (email: string, newPassword: string) => {
    return UserModel.findOneAndUpdate({ email }, { password: newPassword });
  },

  verifyUserEmail: (email: string) => {
    return UserModel.findOneAndUpdate({ email }, { isEmailVerified: true });
  },

  editProfile: (
    userId: Types.ObjectId,
    updatedProfile: {
      username: string;
      branch: string;
      passingYear: string;
      designation: string;
      about: string;
      github: string | null;
      leetcode: string | null;
      linkedin: string | null;
    },
  ) => {
    return UserModel.findByIdAndUpdate(userId, updatedProfile);
  },
};

export default userServices;
