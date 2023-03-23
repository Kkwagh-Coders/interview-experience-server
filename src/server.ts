import { config } from 'dotenv';
import { connectDB } from './config/database';
import { backupDatabase } from './config/backupDB';
import cron from 'node-cron';

// Database and Dotenv config
config();
connectDB();

// backup DB
cron.schedule(process.env['BACKUP_TIME'] || '', backupDatabase);

// Importing app after env and database is configured
import app from './app';

const PORT = process.env['PORT'] || 8080;

app.listen(PORT, () => {
  console.log(`Listening at PORT: ${PORT}`);
});
