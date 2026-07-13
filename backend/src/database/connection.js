const sql = require('mssql');
const dbConfig = require('../config/db.config');
const logger = require('../utils/logger.util');
const MESSAGES = require('../constants/messages.constant');

let pool = null;

const connectDB = async () => {
  try {
    if (pool && pool.connected) {
      return pool;
    }

    pool = await sql.connect(dbConfig);
    logger.info(MESSAGES.DB_CONNECTED);

    // IMPORTANT FIX: pehle sirf error log hoti thi, lekin `pool` variable
    // null nahi hota tha. Isliye agli har request usi TOOTE hue (dead) pool
    // ko use karti rehti thi, aur 15 second timeout hone tak hang hoti thi.
    // Ab error aane par `pool = null` set karte hain, taaki agli request
    // khud automatically naya connection bana le (getPool() ke through).
    pool.on('error', (err) => {
      logger.error('SQL Pool Error - resetting pool', { error: err.message });
      pool = null;
    });

    return pool;
  } catch (error) {
    pool = null;
    logger.error(MESSAGES.DB_CONNECTION_FAILED, { error: error.message });
    throw error;
  }
};

// IMPORTANT FIX: ab ye ASYNC hai. Agar pool null ho chuka hai (error ki
// wajah se) ya disconnect ho chuka hai, to naya connection bana ke deta
// hai — khud retry karta hai, request ko hang/timeout nahi hone deta.
const getPool = async () => {
  if (!pool || !pool.connected) {
    logger.warn('Pool missing/disconnected — reconnecting to DB');
    return connectDB();
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