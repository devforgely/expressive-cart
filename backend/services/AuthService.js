const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const createError = require('http-errors');
const UserModel = require('../models/user');
const safeUser = require('../utils/safeUser');

const UserModelInstance = new UserModel();
const SALT_ROUNDS = 10;

module.exports = class AuthService {

  async register(data) {
    const { email, password, firstName = '', lastName = '' } = data;

    try {
      const user = await UserModelInstance.findOneByEmail(email);

      if (user) {
        throw createError(409, 'Email already in use');
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const created = await UserModelInstance.create({
        email,
        password: hashedPassword,
        firstName,
        lastName
      });

      return safeUser(created);
    } catch (err) {
      if (err.status) {
        throw err;
      }
      throw createError(500, err);
    }
  }

  async login(data) {
    const { email, password } = data;

    try {
      const user = await UserModelInstance.findOneByEmail(email);

      if (!user) {
        throw createError(401, 'Incorrect username or password');
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        throw createError(401, 'Incorrect username or password');
      }

      return safeUser(user);
    } catch (err) {
      if (err.status) {
        throw err;
      }
      throw createError(500, err);
    }
  }

  async findOrCreateGoogleUser(profile) {
    const email = profile?.emails?.[0]?.value?.trim().toLowerCase();

    if (!email) {
      throw createError(400, 'Google account did not provide an email address');
    }

    const socialAuth = {
      provider: 'google',
      id: profile.id
    };

    try {
      const existing = await UserModelInstance.findOneByEmail(email);

      if (existing) {
        await UserModelInstance.update({
          id: existing.id,
          socialAuth
        });
        return safeUser({ ...existing, social_auth: socialAuth });
      }

      const hashedPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), SALT_ROUNDS);
      const created = await UserModelInstance.create({
        email,
        password: hashedPassword,
        firstName: profile.name?.givenName || email.split('@')[0],
        lastName: profile.name?.familyName || '',
        socialAuth
      });

      if (!created) {
        throw createError(500, 'Unable to create account');
      }

      return safeUser(created);
    } catch (err) {
      if (err.status) {
        throw err;
      }
      throw createError(500, err);
    }
  }

  async isLoggedIn(req) {
    try {
      if (req.isAuthenticated()) {
        return { loggedIn: true, user: req.user };
      }
      return { loggedIn: false };
    } catch (err) {
      throw createError(500, err);
    }
  }
};
