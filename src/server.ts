import { config } from 'dotenv';
import { connectDB } from './config/database';

// Database and Dotenv config
config();
connectDB();

// Importing app after env and database is configured
import app from './app';

const PORT = process.env['PORT'] || 8080;

app.listen(PORT, () => {
  console.log(`Listening at PORT: ${PORT}`);
});
