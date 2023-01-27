import { config } from 'dotenv';
import { connectDB } from './config/database';

import app from './app';

// Dotenv config
config();
connectDB();

const PORT = process.env['PORT'] || 8080;

app.listen(PORT, () => {
  console.log(`Listening at PORT: ${PORT}`);
});
