import { spawn, exec } from 'child_process';
import path from 'path';

// TODO: replace all the details from .env file
function backupDatabase() {
  console.log('1');
  const DB_NAME = 'INTERVIEW-EXPERIENCE';
  const ARCHIVE_PATH = path.join('d:\\', `${DB_NAME}.gzip`);
  const DB_URI = process.env['MONGODB_URL'];
  console.log('2');
  const child = spawn('mongodump', [
    '--uri',
    DB_URI,
    // `--archive=${ARCHIVE_PATH}`,
    // '--gzip',
  ]);

  console.log('3');
  child.stdout.on('data', (data: any) => {
    console.log('stdout: \n', data);
  });

  console.log('4');
  child.stderr.on('data', (data: any) => {
    console.log('stderr: \n', data);
  });

  console.log('5');
  child.on('error', (error) => {
    console.log('error: \n', error);
  });

  console.log('6');
  child.on('exit', (code, signal) => {
    if (code) console.log(' Process exited with code :', code);
    else if (signal) console.log(' Process killed with :', signal);
    else console.log('Backup successfull');
  });
}

export function execBackup() {
  const uri = process.env['MONGODB_URL'];
  const command = `mongodump --uri=${uri}`;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Backup failed: ${error.message}`);
      return;
    }
    console.log(`Backup successful: ${stdout}`);
  });
}
export default backupDatabase;
