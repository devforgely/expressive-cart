const express = require('express');
const router = express.Router();
const UserService = require('../services/UserService');
const { requireAuth, requireSelf } = require('../middleware/auth');
const { userIdParam, updateUserRules } = require('../middleware/validate');

const UserServiceInstance = new UserService();

module.exports = (app) => {

  app.use('/users', requireAuth, router);

  router.get('/:userId', userIdParam, requireSelf, async (req, res, next) => {
    try {
      const { userId } = req.params;
      const response = await UserServiceInstance.get({ id: userId });
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  });

  router.put('/:userId', updateUserRules, requireSelf, async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { firstName, lastName, email } = req.body;
      const response = await UserServiceInstance.update({
        id: userId,
        firstName,
        lastName,
        email
      });
      res.status(200).send(response);
    } catch (err) {
      next(err);
    }
  });
};
