import express from 'express';

const app = express();

// Defining the public directory
app.use(express.static(__dirname + '/public'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes

// Home Route
app.get('/', async (req, res) => {
  res.status(200).json({ name: 'Interview Experience API' });
});

// Not found route
app.get('*', (req, res) => {
  return res.status(404).json({ message: 'API URL is not valid' });
});

export default app;
