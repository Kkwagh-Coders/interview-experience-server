import { config } from 'dotenv';
import { connectDB } from './config/database';
import mongoose from 'mongoose';
import app from './app';

mongoose.set('strictQuery', false);

// Dotenv config
config();
connectDB();

const PORT = process.env['PORT'] || 8080;

app.listen(PORT, () => {
  console.log(`Listening at PORT: ${PORT}`);
});
