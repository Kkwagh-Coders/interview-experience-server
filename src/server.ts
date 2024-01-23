import { config } from 'dotenv';
import { connectDB } from './config/database';

// Database and Dotenv config
config();
connectDB();

// Importing app after env and database is configured
import './config/passport';
import app from './app';
import preventServerSleep from './utils/preventServerSleep';

const PORT = process.env['PORT'] || 8080;

app.listen(PORT, () => {
  console.log(`Listening at PORT: ${PORT}`);

  // Create a Job once App is started
  preventServerSleep();
});
