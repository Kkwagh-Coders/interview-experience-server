import { Request, Response } from 'express';
import userServices from '../services/user.service';
import bcrypt from 'bcryptjs';
import { TypeRequestBody } from '../types/request.types';
import { IUser } from '../types/user.types';
import generateToken from '../utils/generateToken';
import crypto from 'crypto';
import sendForgotPasswordEmail from '../services/mail/sendForgotPasswordMail';

const BASE_URL = 'http://localhost:3000/InterviewExperience';
const EXPIRY_DAYS = 180;
const cookieOptions = {
  httpOnly: true,
  maxAge: EXPIRY_DAYS * (24 * 60 * 60 * 1000),
};

const userController = {
  loginUser: async (
    req: TypeRequestBody<{ email?: string; password?: string }>,
    res: Response,
  ) => {
    const email = req.body.email;
    const password = req.body.password;

    // if email or password is undefined
    if (!email || !password) {
      return res.status(401).json({
        message: 'User not found',
      });
    }

    try {
      const user = await userServices.findUser(email);

      // if no such user found.
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // compare the passwords
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(401).json({ message: 'User not found' });
      }

      // set reset fields to null
      userServices.unsetResetFields(email);

      // Check if email is verified or not
      if (!user.isEmailVerified) {
        return res.status(401).json({ message: 'Email is not verified' });
      }

      // generate JWT token
      const token = generateToken(user._id, email, false);

      //setting cookie
      res.cookie('token', token, cookieOptions);

      return res.status(200).json({
        message: 'Login Successful',
        user: { username: user.username, email: user.email },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong.....' });
    }
  },

  registerUser: async (
    // defining type of parameters in req.body
    req: TypeRequestBody<{
      username?: string;
      email?: string;
      password?: string;
      branch?: string;
      passingYear?: string;
      designation?: string;
      about?: string;
      github?: string;
      leetcode?: string;
      linkedin?: string;
    }>,
    res: Response,
  ) => {
    // destructing
    const {
      username,
      email,
      password,
      branch,
      passingYear,
      designation,
      about,
      github,
      leetcode,
      linkedin,
    } = req.body;

    // checking if required fields are undefined
    if (
      !username ||
      !email ||
      !password ||
      !branch ||
      !passingYear ||
      !designation ||
      !about
    ) {
      return res
        .status(401)
        .json({ message: 'Please enter all required fields ' });
    }

    try {
      // check if email is registerd
      const oldUser = await userServices.findUser(email);

      if (oldUser && oldUser.isEmailVerified) {
        return res.status(404).json({ message: 'Email already exists' });
      }

      if (oldUser && !oldUser.isEmailVerified) {
        await userServices.deleteUser(oldUser._id);
      }

      // Hash the password
      const hashPassword = await bcrypt.hash(password, 12);

      // creating the user(IUser) object
      const userData: IUser = {
        username,
        email,
        password: hashPassword,
        isEmailVerified: false,
        branch,
        passingYear,
        designation,
        about,
        github: github ? github : null,
        leetcode: leetcode ? leetcode : null,
        linkedin: linkedin ? linkedin : null,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      };

      // create user account
      await userServices.createUser(userData);

      // TODO : send Email Verification

      return res.status(200).json({
        message: 'Account created successfully, please verify your email....',
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong.....' });
    }
  },

  forgotPassword: async (
    req: TypeRequestBody<{ email: string }>,
    res: Response,
  ) => {
    const email = req.body.email;

    // if email is undefined
    if (!email) {
      return res
        .status(401)
        .json({ message: 'Please enter all required fields ' });
    }

    try {
      // check if email is not-registered
      const user = await userServices.findUser(email);
      if (!user) {
        return res.status(401).json({ message: 'No such email found' });
      }

      // TODO : Edge case when the randomly generated token may be same
      // generate a token
      const resetPasswordToken = crypto.randomBytes(16).toString('hex');
      const resetPasswordExpiry = 1000 * 60 * 60; // 1 hour

      // set reset fields
      await userServices.setResetFields(email, {
        resetPasswordToken,
        resetPasswordExpiry,
      });

      // send email
      const verificationURL =
        BASE_URL + '/' + 'reset-password/' + resetPasswordToken;
      sendForgotPasswordEmail(email, verificationURL, user.username);

      // return response
      // TODO : change Response
      return res.status(200).json({
        message: 'A password reset link is sent to ' + email + '.',
        data: {
          resetPasswordToken,
          resetPasswordExpiry,
          verificationURL,
          email,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong.....' });
    }
  },

  resetPassword: async (
    req: TypeRequestBody<{ newPassword: string }>,
    res: Response,
  ) => {
    const newPassword = req.body.newPassword;
    if (!newPassword) {
      return res
        .status(401)
        .json({ message: 'Please enter all required fields ' });
    }
    try {
      const resetPasswordToken = req.params['token'];
      console.log(resetPasswordToken, newPassword);
      const user = await userServices.findUserWithToken(resetPasswordToken);
      if (!user) {
        return res
          .status(401)
          .json({ message: 'Password reset Link is invalid or has expired.' });
      }

      console.log('user found');
      await userServices.resetPassword(resetPasswordToken, newPassword);

      console.log('password changed');
      return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong.....' });
    }
  },
  logoutUser: (req: Request, res: Response) => {
    res.clearCookie('token');
    return res.status(200).json({ message: 'User Logout successful' });
  },
};

export default userController;
