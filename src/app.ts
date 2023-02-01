import express from 'express';
import cors from 'cors';
import routes from './routes';
import cookieParser from 'cookie-parser';
const app = express();

// Defining the public directory
app.use(express.static(__dirname + '/public'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());

// Routes
app.use('/user', routes.userRoutes);

// Home Route
app.get('/', async (req, res) => {
  res.status(200).json({ name: 'Interview Experience API' });
});

// Not found route
app.get('*', (req, res) => {
  return res.status(404).json({ message: 'API URL is not valid' });
});

export default app;
