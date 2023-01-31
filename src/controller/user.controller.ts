import { Response } from 'express';
import userServices from '../services/user.service';
import bcrypt from 'bcryptjs';
import { TypeRequestBody } from '../types/request.types';
import middleware from '../middleware/middleware';
import { IUser } from '../types/user.types';

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
        console.log('user not found ');
        return res.status(401).json({ message: 'User not found' });
      }

      // compare the passwords
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        console.log('user not found ');
        return res.status(401).json({ message: 'User not found' });
      }

      // generate JWT token
      const token = middleware.generateToken(email, user._id);
      return res.status(200).json({ message: 'Login Successful', token });
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
      const isUserPresent = await userServices.findUser(email);

      if (isUserPresent) {
        return res.status(404).json({ message: 'Email already exists' });
      }

      // Hash the password
      const hashPassword = await bcrypt.hash(password, 12);

      // creating the user(IUser) object
      const user: IUser = {
        username,
        email,
        password: hashPassword,
        branch,
        passingYear,
        designation,
        about,
        github: github ? github : null,
        leetcode: leetcode ? leetcode : null,
        linkedin: linkedin ? linkedin : null,
      };

      // create user account
      const newUser = await userServices.createUser(user);

      // generate JWT token
      const token = middleware.generateToken(email, newUser._id);

      return res
        .status(200)
        .json({ message: 'User registered successful', token });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: 'Something went wrong.....' });
    }
  },
  // logoutUser: (req: Request, res: Response) => {},
  // forgotPassword: (req: Request, res: Response) => {},
};

export default userController;
