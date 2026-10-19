const express = require('express');
const createError = require('http-errors');
const router = express.Router();

const AuthService = require('../services/AuthService');
const AuthServiceInstance = new AuthService();
const { loginRules, registerRules } = require('../middleware/validate');
const { FRONTEND_ORIGIN, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = require('../config');

const googleConfigured = Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);

const redirectToLogin = (res, reason) => {
  res.redirect(`${FRONTEND_ORIGIN}/login?error=${reason}`);
};

module.exports = (app, passport) => {

  app.use('/auth', router);

  router.post('/register', registerRules, async (req, res, next) => {
    try {
      const data = req.body;
      const response = await AuthServiceInstance.register(data);
      req.login(response, (err) => {
        if (err) {
          return next(err);
        }
        return res.status(200).send(response);
      });
    } catch (err) {
      next(err);
    }
  });

  router.post('/login', loginRules, (req, res, next) => {
    passport.authenticate('local', (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return next(createError(401, 'Incorrect username or password'));
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        return res.status(200).send(user);
      });
    })(req, res, next);
  });

  router.get('/google', (req, res, next) => {
    if (!googleConfigured) {
      return redirectToLogin(res, 'google_unavailable');
    }

    return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  });

  router.get('/google/callback', (req, res, next) => {
    if (!googleConfigured) {
      return redirectToLogin(res, 'google_unavailable');
    }

    return passport.authenticate('google', (err, user) => {
      if (err || !user) {
        return redirectToLogin(res, 'google_failed');
      }

      req.login(user, (loginErr) => {
        if (loginErr) {
          return redirectToLogin(res, 'google_failed');
        }
        return res.redirect(FRONTEND_ORIGIN);
      });
    })(req, res, next);
  });

  router.post('/logout', (req, res, next) => {
    const finish = () => {
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          return next(destroyErr);
        }
        res.clearCookie('connect.sid');
        return res.status(200).send({ loggedIn: false });
      });
    };

    if (typeof req.logout === 'function') {
      req.logout((err) => {
        if (err) {
          return next(err);
        }
        finish();
      });
      return;
    }

    finish();
  });

  router.get('/logged_in', async (req, res, next) => {
    try {
      const response = await AuthServiceInstance.isLoggedIn(req);
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  });
};
