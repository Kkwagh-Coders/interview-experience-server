import postModel from '../models/post.model';
import { IPostForm } from '../types/post.types';

const postServices = {
  createPost: (post: IPostForm) => {
    return postModel.create(post);
  },
};

export default postServices;
