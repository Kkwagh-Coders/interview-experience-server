import { Request, Response } from 'express';
import adminService from '../services/admin.service';
import userServices from '../services/user.service';
import { IAuthToken } from '../types/token.types';
import decodeToken from '../utils/token/decodeToken';

const statusController = {
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

      // Check if the user is admin or not
      if (authTokenData.isAdmin) {
        const admin = await adminService.findUser(authTokenData.email);

        if (!admin) {
          return res.status(200).json({
            isLoggedIn: false,
            isAdmin: false,
            admin: null,
            user: null,
          });
        }

        const adminResponseData = {
          username: admin.username,
          email: admin.email,
        };

        return res.status(200).json({
          isLoggedIn: true,
          isAdmin: true,
          admin: adminResponseData,
          user: null,
        });
      } else {
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
          username: user.username,
          email: user.email,
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
          isAdmin: false,
          admin: null,
          user: userResponseData,
        });
      }
    } catch (err) {
      // We return 400 because the request failed for unknown reason
      return res
        .status(400)
        .json({ isLoggedIn: false, isAdmin: false, admin: null, user: null });
    }
  },
};

export default statusController;
