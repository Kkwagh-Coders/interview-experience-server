import mongoose from 'mongoose';

export const connectDB = () => {
  const MONGODB_URL = process.env['MONGODB_URL'];

  if (!MONGODB_URL) {
    console.log('MONGODB_URL Not Found in ENV');
    process.exit(1);
  }

  mongoose
    .connect(MONGODB_URL)
    .then(() => {
      console.log('DB CONNECTED SUCCESSFULLY');
    })
    .catch((error) => {
      console.log('DB CONNECTION FAILED');
      console.log(error);
      process.exit(1);
    });
};
