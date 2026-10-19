"use strict";

const { Pool } = require('pg');
const { DB } = require('../config');

const pool = new Pool({
  user: DB.PGUSER,
  host: DB.PGHOST,
  database: DB.PGDATABASE,
  password: DB.PGPASSWORD,
  port: DB.PGPORT
});

function resolveDb(dbClient) {
  if (dbClient && typeof dbClient.query === 'function') {
    return dbClient;
  }
  return module.exports;
}

async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('Transaction rollback failed');
    }
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  resolveDb,
  withTransaction
};