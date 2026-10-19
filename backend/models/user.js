const db = require('../db');
const pgp = require('pg-promise')({ capSQL: true });

const skipUndefined = col => col.value === undefined;

const userInsertTable = new pgp.helpers.ColumnSet([
  'email',
  'password',
  { name: 'first_name', prop: 'firstName' },
  { name: 'last_name', prop: 'lastName' },
  { name: 'social_auth', prop: 'socialAuth', mod: ':json', def: null }
], { table: 'users' });

const userUpdateTable = new pgp.helpers.ColumnSet([
  { name: 'email', skip: skipUndefined },
  { name: 'password', skip: skipUndefined },
  { name: 'first_name', prop: 'firstName', skip: skipUndefined },
  { name: 'last_name', prop: 'lastName', skip: skipUndefined },
  { name: 'social_auth', prop: 'socialAuth', mod: ':json', skip: skipUndefined },
  { name: 'updated_at', prop: 'updatedAt', skip: skipUndefined }
], { table: 'users' });

module.exports = class UserModel {

  /**
   * Creates a new user record
   * @param  {Object}      data [User data]
   * @return {Object|null}      [Created user record]
   */
  async create(data) {
    try {
      const statement = pgp.helpers.insert(data, userInsertTable) + ' RETURNING *';
      const result = await db.query(statement);

      if (result.rows?.length) {
        return result.rows[0];
      }

      return null;
    } catch (err) {
      throw new Error(err);
    }
  }

  /**
   * Updates a user record
   * @param  {Object}      data [User data]
   * @return {Object|null}      [Updated user record]
   */
  async update(data) {
    try {
      const { id, ...params } = data;
      const condition = pgp.as.format('WHERE id = ${id} RETURNING *', { id });
      const statement = pgp.helpers.update(params, userUpdateTable) + condition;
      const result = await db.query(statement);

      if (result.rows?.length) {
        return result.rows[0];
      }

      return null;
    } catch (err) {
      throw new Error(err);
    }
  }

  /**
   * Finds a user record by email
   * @param  {String}      email [Email address]
   * @return {Object|null}       [User record]
   */
  async findOneByEmail(email) {
    try {
      const statement = `SELECT *
                         FROM users
                         WHERE email = $1`;
      const values = [email];
      const result = await db.query(statement, values);

      if (result.rows?.length) {
        return result.rows[0];
      }

      return null;
    } catch (err) {
      throw new Error(err);
    }
  }

  /**
   * Finds a user record by ID
   * @param  {String}      id [User ID]
   * @return {Object|null}    [User Record]
   */
  async findOneById(id) {
    try {
      const statement = `SELECT *
                         FROM users
                         WHERE id = $1`;
      const values = [id];
      const result = await db.query(statement, values);

      if (result.rows?.length) {
        return result.rows[0];
      }

      return null;
    } catch (err) {
      throw new Error(err);
    }
  }
};
