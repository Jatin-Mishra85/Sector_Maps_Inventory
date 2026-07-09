const sql = require('mssql');
const dbConfig = require('../config/db.config');
const logger = require('../utils/logger.util');
const MESSAGES = require('../constants/messages.constant');

let pool = null;

const connectDB = async () => {
  try {
    if (pool) {
      return pool;
    }

    pool = await sql.connect(dbConfig);
    logger.info(MESSAGES.DB_CONNECTED);

    pool.on('error', (err) => {
      logger.error('SQL Pool Error', { error: err.message });
    });

    return pool;
  } catch (error) {
    logger.error(MESSAGES.DB_CONNECTION_FAILED, { error: error.message });
    throw error;
  }
};

const getPool = () => {
  if (!pool) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return pool;
};

const closeDB = async () => {
  if (pool) {
    await pool.close();
    pool = null;
  }
};

module.exports = {
  connectDB,
  getPool,
  closeDB,
  sql,
};