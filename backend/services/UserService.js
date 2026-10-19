const createError = require('http-errors');
const UserModel = require('../models/user');
const safeUser = require('../utils/safeUser');

const UserModelInstance = new UserModel();

module.exports = class UserService {

  async get(data) {
    const { id } = data;

    try {
      const user = await UserModelInstance.findOneById(id);

      if (!user) {
        throw createError(404, 'User record not found');
      }

      return safeUser(user);
    } catch (err) {
      throw err;
    }
  }

  async update(data) {
    try {
      const user = await UserModelInstance.update(data);
      return safeUser(user);
    } catch (err) {
      throw err;
    }
  }
};
