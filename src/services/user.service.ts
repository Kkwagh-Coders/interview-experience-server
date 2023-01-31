import UserModel from '../models/user.model';

import { IUser } from '../types/user.types';

const userServices = {
  findUser: (email: string) => {
    return UserModel.findOne({ email });
  },

  createUser: (user: IUser) => {
    return UserModel.create(user);
  },
};

export default userServices;
