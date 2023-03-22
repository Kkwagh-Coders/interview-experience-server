import { spawn, exec } from 'child_process';
import path from 'path';

export const backupDatabase = () => {
  // setting up variables
  console.log('Setting up variables....');

  const DB_NAME = process.env['DB_NAME'];
  const currentDate = Date.now().toString();
  const BACKUP_PATH = path.join(
    __dirname,
    'backup',
    `${DB_NAME}${currentDate}.gzip`,
  );
  const DB_URI = process.env['MONGODB_BACKUP_URL'];
  const args = [`--uri ${DB_URI}`, `--out ${BACKUP_PATH}`, `--gzip`];

  // creating child process
  console.log('Creating child process....');
  const child = spawn('mongodump', args);
  console.log('Child process created....');

  // setting up handlers
  console.log('Setting up handlers....');
  child.stdout.on('data', (data: Buffer) => {
    console.log('output on terminal : \n', data);
  });

  child.stderr.on('data', (data: Buffer) => {
    console.log('output error on terminal: \n', data);
  });

  child.on('error', (error) => {
    console.log('error: \n', error);
  });

  child.on('exit', (code, signal) => {
    if (code) console.log(' Process exited with code :', code);
    else if (signal) console.log(' Process killed with :', signal);
    else console.log('Backup successfull at ', currentDate);
  });
  console.log('End....');
};
