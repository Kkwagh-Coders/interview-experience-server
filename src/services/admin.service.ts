import adminModel from '../models/admin.model';

const adminService = {
  findUser: (email: string) => {
    return adminModel.findOne({ email });
  },
};

export default adminService;
