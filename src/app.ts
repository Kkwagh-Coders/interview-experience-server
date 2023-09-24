import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import routes from './routes';
import passport from 'passport';

const app = express();

// Defining the public directory
app.use(express.static(__dirname + '/public'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Routes
app.use('/user', routes.userRoutes);
app.use('/posts', routes.postRoutes);
app.use('/comments', routes.commentRoutes);
app.use('/quiz', routes.quizRoutes);

// Home Route
app.get('/', cors(), async (req, res) => {
  res.status(200).json({ name: 'Interview Experience API' });
});

// Not found route
app.get('*', cors(), (req, res) => {
  return res.status(404).json({ message: 'API URL is not valid' });
});

export default app;
