export interface IUser {
  username: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  branch: string;
  passingYear: string;
  designation: string;
  about: string;
  github: string | null;
  leetcode: string | null;
  linkedin: string | null;
  resetPasswordToken: string | null;
  resetPasswordExpiry: Date | null;
}
