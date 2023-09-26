import { Aggregate, Types } from 'mongoose';
import UserModel from '../models/user.model';

import { IUser, IUserProfile } from '../types/user.types';

const userServices = {
  findUserById: (id: Types.ObjectId) => {
    return UserModel.findOne({ _id: id });
  },

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

  getUserProfile: (userId: Types.ObjectId): Aggregate<IUserProfile[]> => {
    return UserModel.aggregate([
      { $match: { _id: userId } },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'userId',
          as: 'postData',
          pipeline: [
            {
              $addFields: {
                upVoteCount: {
                  $size: '$upVotes',
                },
                downVoteCount: {
                  $size: '$downVotes',
                },
              },
            },
            {
              $group: {
                _id: null,
                viewCount: { $sum: '$views' },
                postCount: { $sum: 1 },
                upVoteCount: { $sum: '$upVoteCount' },
                downVoteCount: { $sum: '$downVoteCount' },
              },
            },
          ],
        },
      },
      {
        $project: {
          password: 0,
          isAdmin: 0,
          isEmailVerified: 0,
          'postData._id': 0,
          _id: 0,
        },
      },
    ]);
  },

  searchUser: (
    search: string,
    limit: number,
    skip: number,
  ): Aggregate<{ username: string; branch: string; passingYear: string }[]> => {
    return UserModel.aggregate([
      {
        $match: {
          username: {
            $regex: new RegExp(search, 'i'),
          },
          isEmailVerified: true,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $project: {
          username: 1,
          designation: 1,
          passingYear: 1,
          branch: 1,
        },
      },
    ]);
  },
};

export default userServices;
