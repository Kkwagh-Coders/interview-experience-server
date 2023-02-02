import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import routes from './routes';

const app = express();

// Defining the public directory
app.use(express.static(__dirname + '/public'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    credentials: true,
  }),
);
app.use(cookieParser());

// Routes
app.use('/user', routes.userRoutes);
app.use('/status', routes.statusRoutes);

// Home Route
app.get('/', async (req, res) => {
  res.status(200).json({ name: 'Interview Experience API' });
});

// Not found route
app.get('*', (req, res) => {
  return res.status(404).json({ message: 'API URL is not valid' });
});

export default app;
