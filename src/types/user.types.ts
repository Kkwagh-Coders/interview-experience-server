export interface IUser {
  username: string;
  email: string;
  password: string;
  isAdmin: boolean;
  isEmailVerified: boolean;
  branch: string;
  passingYear: string;
  designation: string;
  about: string;
  github: string | null;
  leetcode: string | null;
  linkedin: string | null;
}

export interface IUserProfile {
  username: string;
  email: string;
  branch: string;
  passingYear: string;
  designation: string;
  about: string;
  github: string | null;
  leetcode: string | null;
  linkedin: string | null;
  postData: [
    {
      viewCount: number;
      postCount: number;
      upVoteCount: number;
      downVoteCount: number;
    },
  ];
}
