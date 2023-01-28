export interface Iuser {
  username: string;
  email: string;
  password: string;
  branch: string;
  passingYear: string;
  designation: string;
  about: string;
  github: string | null;
  leetcode: string | null;
  linkedin: string | null;
}

/*
    github, leetcode and linkedin are optional field
    union operator is used to make it optionally nullable
    using it, fields must be explicitely defined null 
*/

export default Iuser;
