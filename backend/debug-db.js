require('dotenv').config();
const { connectDB, getPool } = require('./src/database/connection');

(async () => {
  await connectDB();
  const pool = getPool();

  const result = await pool.request().query(`
    SELECT DB_NAME() AS current_db, @@SERVERNAME AS server_name;
  `);
  console.log('Connected to:', result.recordset);

  const cols = await pool.request().query(`
    SELECT COLUMN_NAME, LEN(COLUMN_NAME) AS name_length
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Inventories';
  `);
  console.log('Columns:', cols.recordset);

  process.exit(0);
})();