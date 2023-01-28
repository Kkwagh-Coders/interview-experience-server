import express from 'express';
import * as test from './controller/test.controller';

const app = express();

// Defining the public directory
app.use(express.static(__dirname + '/public'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes

// Test Routes
app.get('/test-admin', test.testAdmin);
app.get('/test-user', test.testUser);

// Home Route
app.get('/', async (req, res) => {
  res.status(200).json({ name: 'Interview Experience API' });
});

// Not found route
app.get('*', (req, res) => {
  return res.status(404).json({ message: 'API URL is not valid' });
});

export default app;
