import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import sendEmailVerificationMail from '../services/mail/sendEmailVerificationMail';
import sendForgotPasswordEmail from '../services/mail/sendForgotPasswordMail';
import userServices from '../services/user.service';
import { TypeRequestBody } from '../types/request.types';
import {
  IAuthToken,
  IEmailVerificationToken,
  IForgotPasswordToken,
} from '../types/token.types';
import { IUser } from '../types/user.types';
import decodeToken from '../utils/token/decodeToken';
import generateAuthToken from '../utils/token/generateAuthToken';
import generateEmailVerificationToken from '../utils/token/generateEmailVerificationToken';
import generateForgotPasswordToken from '../utils/token/generateForgotPasswordToken';

const EXPIRY_DAYS = 180;

// Solving cookie issue: https://stackoverflow.com/questions/66503751/cross-domain-session-cookie-express-api-on-heroku-react-app-on-netlify/66553425#66553425?newreg=fcbd128fac8c4569a41212157ee2c173
type COOKIE_OPTIONS = {
  sameSite: 'none' | 'lax';
  secure: boolean;
  httpOnly: boolean;
  maxAge: number;
  path: string;
};

const cookieOptions: COOKIE_OPTIONS = {
  sameSite: process.env['NODE_ENV'] === 'production' ? 'none' : 'lax', // must be 'none' to enable cross-site delivery
  secure: process.env['NODE_ENV'] === 'production', // must be true if sameSite='none',
  httpOnly: true,
  maxAge: EXPIRY_DAYS * (24 * 60 * 60 * 1000),
  path: '/',
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
        message: 'Incorrect Username or Password',
      });
    }

    try {
      const user = await userServices.findUser(email);

      // if no such user found.
      if (!user) {
        return res
          .status(401)
          .json({ message: 'Incorrect Username or Password' });
      }

      // compare the passwords
      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
        return res
          .status(401)
          .json({ message: 'Incorrect Username or Password' });
      }

      // Check if email is verified or not
      if (!user.isEmailVerified) {
        return res.status(401).json({ message: 'Email is not verified' });
      }

      // generate JWT token
      const token = generateAuthToken(user._id, email, user.isAdmin);

      //setting cookie
      res.cookie('token', token, cookieOptions);

      // Remove the password
      return res.status(200).json({
        message: 'Login Successful',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          branch: user.branch,
          passingYear: user.passingYear,
          designation: user.designation,
          about: user.about,
          github: user.github,
          leetcode: user.leetcode,
          linkedin: user.linkedin,
        },
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
      // check if email is registered
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
        isAdmin: false,
        isEmailVerified: false,
        branch,
        passingYear,
        designation,
        about,
        github: github ? github : null,
        leetcode: leetcode ? leetcode : null,
        linkedin: linkedin ? linkedin : null,
      };

      // create user account
      const user = await userServices.createUser(userData);

      // Generate token
      const token = generateEmailVerificationToken(
        user._id,
        email,
        user.isAdmin,
      );

      // send email to the user for verification
      await sendEmailVerificationMail(email, token, user.username);

      return res.status(200).json({
        message: 'Account created successfully, please verify your email....',
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong.....' });
    }
  },

  forgotPassword: async (
    req: TypeRequestBody<{ email?: string }>,
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

      if (!user.isEmailVerified) {
        return res.status(400).json({ message: 'Please Verify your Email' });
      }

      // Creating a jwt token and sending it to the user
      const token = generateForgotPasswordToken(user._id, email, user.isAdmin);

      // send email to the user
      sendForgotPasswordEmail(email, token, user.username);

      return res
        .status(200)
        .json({ message: `A password reset link is sent to ${email}` });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Error, Please try again later' });
    }
  },

  resetPassword: async (
    req: TypeRequestBody<{ email?: string; newPassword?: string }>,
    res: Response,
  ) => {
    const email = req.body.email;
    const newPassword = req.body.newPassword;
    const resetPasswordToken = req.params['token'];

    if (!email) {
      return res.status(401).json({ message: 'Please enter Email' });
    }

    if (!newPassword) {
      return res.status(401).json({ message: 'Please enter new Password ' });
    }

    try {
      const tokenData = decodeToken(resetPasswordToken) as IForgotPasswordToken;

      if (email !== tokenData.email) {
        return res.status(403).json({ message: 'Reset Link is not valid' });
      }

      const user = await userServices.findUser(tokenData.email);
      if (!user) {
        return res
          .status(401)
          .json({ message: 'Please create a new Reset Password Link' });
      }

      // Hash the password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Resetting the password
      await userServices.resetPassword(tokenData.email, hashedNewPassword);
      return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: 'Error, generate new password link' });
    }
  },
  logoutUser: (req: Request, res: Response) => {
    res.clearCookie('token', cookieOptions);
    return res.status(200).json({ message: 'User Logout successful' });
  },
  verifyEmail: async (req: Request, res: Response) => {
    const emailVerificationToken = req.params['token'];

    try {
      const { email } = decodeToken(
        emailVerificationToken,
      ) as IEmailVerificationToken;

      const user = await userServices.findUser(email);
      if (!user) {
        return res
          .status(401)
          .json({ message: 'User Not Found with the Email' });
      }

      // Update the user email field
      await userServices.verifyUserEmail(email);

      const CLIENT_BASE_URL = process.env['CLIENT_BASE_URL'];

      if (!CLIENT_BASE_URL) return res.redirect('/');
      return res.redirect(`${CLIENT_BASE_URL}/login`);
    } catch (error) {
      // Send a simple html to user if error
      res.setHeader('Content-type', 'text/html');
      return res.send('<h1>Error Authenticating</h1>');
    }
  },
  deleteUser: async (
    req: TypeRequestBody<{ authTokenData: IAuthToken }>,
    res: Response,
  ) => {
    // As we are running middleware no need to use ? on authTokenData
    const userData = req.body.authTokenData;

    if (!userData) {
      return res.status(403).json({ message: 'User not logged in' });
    }

    try {
      // Delete the user Account
      await userServices.deleteUser(userData.id);
      return res.status(200).json({ message: 'User Account deleted' });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: 'Error during Deletion, Please try again later' });
    }
  },
  getLoginStatus: async (req: Request, res: Response) => {
    const token = req.cookies['token'];

    // We are using 200 because the request was successful and we return isLoggedIn false
    if (!token) {
      return res
        .status(200)
        .json({ isLoggedIn: false, isAdmin: false, admin: null, user: null });
    }

    try {
      // Verify the token
      const authTokenData = decodeToken(token) as IAuthToken;

      // Check if the user
      const user = await userServices.findUser(authTokenData.email);

      if (!user) {
        return res.status(200).json({
          isLoggedIn: false,
          isAdmin: false,
          admin: null,
          user: null,
        });
      }

      const userResponseData = {
        userId: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        branch: user.branch,
        passingYear: user.passingYear,
        designation: user.designation,
        about: user.about,
        github: user.github,
        leetcode: user.leetcode,
        linkedin: user.linkedin,
      };

      return res.status(200).json({
        isLoggedIn: true,
        isAdmin: user.isAdmin,
        admin: null,
        user: userResponseData,
      });
    } catch (err) {
      // We return 400 because the request failed for unknown reason
      return res
        .status(400)
        .json({ isLoggedIn: false, isAdmin: false, admin: null, user: null });
    }
  },

  editUserProfile: async (
    req: TypeRequestBody<{
      username: string;
      branch: string;
      passingYear: string;
      designation: string;
      about: string;
      github?: string;
      leetcode?: string;
      linkedin?: string;
      authTokenData: IAuthToken;
    }>,
    res: Response,
  ) => {
    // destructure the code
    const {
      username,
      branch,
      passingYear,
      designation,
      about,
      github,
      leetcode,
      linkedin,
    } = req.body;

    if (!username || !branch || !passingYear || !designation || !about) {
      return res.status(401).json({ message: 'Please enter all the fields ' });
    }

    const updatedProfile = {
      username,
      branch,
      passingYear,
      designation,
      about,
      github: github ? github : null,
      leetcode: leetcode ? leetcode : null,
      linkedin: linkedin ? linkedin : null,
    };

    const userId = req.body.authTokenData.id;
    try {
      const user = await userServices.editProfile(userId, updatedProfile);
      return res
        .status(200)
        .json({ message: 'User Profile Edited Successfully', data: user });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'something went wrong......' });
    }
  },

  getUserProfile: async (req: Request, res: Response) => {
    const paramId = req.params['id'];

    // if not a valid user id
    if (!mongoose.Types.ObjectId.isValid(paramId)) {
      return res.status(404).json({ message: 'No such user found' });
    }

    const userId = new Types.ObjectId(paramId);
    try {
      const userProfile = await userServices.getUserProfile(userId);

      if (userProfile.length === 0) {
        return res.status(404).json({ message: 'No such User found' });
      }

      // if no post
      if (userProfile[0].postData.length === 0) {
        userProfile[0].postData.push({
          viewCount: 0,
          postCount: 0,
          upVoteCount: 0,
          downVoteCount: 0,
        });
      }
      return res.status(200).json({ message: 'ok', data: userProfile });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'something went wrong...' });
    }
  },

  searchUser: async (req: Request, res: Response) => {
    let search = req.query['searchparam'] as string;
    let page = parseInt(req.query['page'] as string) - 1;
    let limit = parseInt(req.query['limit'] as string);

    if (!search) search = '';
    if (!page || page < 0) page = 0;
    if (!limit || limit <= 0) limit = 10;

    if (limit > 100) {
      return res.status(500).json({ message: 'Limit cannot exceed 100' });
    }

    const skip = limit * page;
    try {
      const userList = await userServices.searchUser(search, limit, skip);

      if (userList.length === 0) {
        return res.status(200).json({
          message: 'No posts to display',
          data: [],
          page: { previousPage: page === 0 ? undefined : page },
        });
      }

      // as frontend is 1 based page index
      const nextPage = page + 2;
      // previous page is returned as page because for 1 based indexing page is the previous page as page-1 is done
      const previousPage = page === 0 ? undefined : page;

      return res.status(200).json({
        message: 'Users fetched successfully',
        data: userList,
        page: { nextPage, previousPage },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'something went wrong...' });
    }
  },
  googleLogin: async (req: Request, res: Response) => {
    if (!req.user) {
      return res.send('ERROR with Google Login');
    }

    const userData = req.user as IUser;
    const email = userData.email;
    const user = await userServices.findUser(email);

    if (!user) {
      return res.send('ERROR with Google Login');
    }

    // generate JWT token
    const token = generateAuthToken(user._id, email, user.isAdmin);

    //setting cookie
    res.cookie('token', token, cookieOptions);

    // Successful authentication, redirect home.
    const clientURL = process.env['CLIENT_BASE_URL'] || 'http://localhost:3000';
    return res.redirect(clientURL);
  },
  setToken: (req: Request, res: Response) => {
    const token = req.params['token'];
    res.cookie('token', token, cookieOptions);

    return res.status(200).json({ message: 'Token set successfully' });
  },
};

export default userController;
