import cron from 'node-cron';
import axios from 'axios';

const makeRequestToServer = (SERVER_BASE_URL: string) => {
  axios
    .get(SERVER_BASE_URL)
    .then((res) => console.log('Result: ', res.status))
    .catch((err) => {
      console.error('Error: ', err.status);
      // Recursively ping if failed
      makeRequestToServer(SERVER_BASE_URL);
    });
};

// Background Service
const preventServerSleep = () => {
  console.log('Scheduling the Task');
  const SERVER_BASE_URL = process.env['SERVER_BASE_URL'];
  if (!SERVER_BASE_URL) {
    throw new Error('SERVER_BASE_URL not Defined');
  }

  const FRIEND_SERVER = process.env['FRIEND_SERVER'];

  // Ping the server
  cron.schedule('*/10 * * * *', () => {
    // Making a request to itself or the server
    makeRequestToServer(SERVER_BASE_URL);
    if (FRIEND_SERVER) {
      makeRequestToServer(FRIEND_SERVER);
    }
  });
};

export default preventServerSleep;
