import { randomUUID } from 'crypto';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import userServices from '../services/user.service';

const GOOGLE_CLIENT_ID = process.env['GOOGLE_CLIENT_ID'];
const GOOGLE_CLIENT_SECRET = process.env['GOOGLE_CLIENT_SECRET'];

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.log('Google Auth Credential not Found in ENV!!');
  process.exit(1);
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: '/user/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (accessToken: string, refreshToken: string, profile, done) => {
      try {
        if (!profile.emails) {
          return done('Email not Found');
        }

        const userEmail = profile.emails[0].value;
        const user = await userServices.findUser(userEmail);

        // If user is already present
        if (user) {
          return done(null, user);
        }

        // Create user if not present
        const newUser = await userServices.createUser({
          username: profile.displayName,
          email: userEmail,
          password: randomUUID(),
          isAdmin: false,
          isEmailVerified: true,
          branch: 'NA',
          passingYear: 'NA',
          designation: 'NA',
          about: 'Hi, Created the Profile Recently!!',
          github: null,
          leetcode: null,
          linkedin: null,
        });

        return done(null, newUser);
      } catch (error) {
        console.log(error);
        return done('Error while login');
      }
    },
  ),
);
