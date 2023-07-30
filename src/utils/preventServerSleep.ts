import cron from 'node-cron';
import ping from 'ping';

const pingServer = (SERVER_BASE_URL: string) => {
  ping.promise
    .probe(SERVER_BASE_URL)
    .then((res) => console.log('Result: ', res))
    .catch((err) => {
      // Recursively ping if failed
      pingServer(SERVER_BASE_URL);
      console.error('Error: ', err);
    });
};

// Background Service
const preventServerSleep = () => {
  console.log('Scheduling the Task');
  const SERVER_BASE_URL = process.env['SERVER_BASE_URL'];
  if (!SERVER_BASE_URL) {
    throw new Error('SERVER_BASE_URL not Defined');
  }

  // Ping the server
  cron.schedule('*/10 * * * *', () => {
    // Making a request to itself or the server
    pingServer(SERVER_BASE_URL);
  });
};

export default preventServerSleep;
