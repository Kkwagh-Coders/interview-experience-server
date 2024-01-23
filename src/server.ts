import { config } from 'dotenv';
import { connectDB } from './config/database';

// Database and Dotenv config
config();
connectDB();

// Importing app after env and database is configured
import './config/passport';
import app from './app';
import preventServerSleep from './utils/preventServerSleep';

// Display the Node version
const NODE_VERSION = process.env['NODE_VERSION'];
console.info('Node Version: ', NODE_VERSION);

const PORT = process.env['PORT'] || 8080;

app.listen(PORT, () => {
  console.log(`Listening at PORT: ${PORT}`);

  // Create a Job once App is started
  preventServerSleep();
});
