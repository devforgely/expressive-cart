const passport = require('passport');
const LocalStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const AuthService = require('../services/AuthService');
const UserModel = require('../models/user');
const safeUser = require('../utils/safeUser');
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL
} = require('../config');

const AuthServiceInstance = new AuthService();
const UserModelInstance = new UserModel();

module.exports = (app) => {

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await UserModelInstance.findOneById(id);
      done(null, user ? safeUser(user) : false);
    } catch (err) {
      done(err);
    }
  });

  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await AuthServiceInstance.login({ email, password });
        return done(null, user);
      } catch (err) {
        if (err.status === 401) {
          return done(null, false);
        }
        return done(err);
      }
    }
  ));

  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await AuthServiceInstance.findOrCreateGoogleUser(profile);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }));
  }

  return passport;
};
