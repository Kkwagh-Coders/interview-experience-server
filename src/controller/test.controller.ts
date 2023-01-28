import admin from '../models/admin.model';
import user from '../models/user.model';

// to check if admin can be created or not
export const testAdmin = async (req: any, res: any) => {
  try {
    // sample admin object
    const adminUser = {
      username: 'suhaan',
      email: 'suhaan@gmail.com',
      password: '1234',
    };
    await admin.create(adminUser);

    return res.status(200).send('admin created');
  } catch (error) {
    console.log(error);
    return res.status(501);
  }
};

// to check if user can be created or not
export const testUser = async (req: any, res: any) => {
  try {
    // sample user object
    const newUser = {
      username: 'dhruv',
      email: 'dhruv@gmail.com',
      password: 'dhruv',
      branch: 'IT',
      passingYear: '2024',
      designation: 'Student',
      about: 'Programmer',
      github: null,
      leetcode: null,
      linkedin: null,
    };

    await user.create(newUser);
    return res.status(200).send('User created');
  } catch (error) {
    console.log(error);
    return res.status(501);
  }
};
