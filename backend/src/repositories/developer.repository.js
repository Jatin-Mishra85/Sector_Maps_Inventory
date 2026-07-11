const { getPool, sql } = require('../database/connection');

const TABLE = 'Developers';

const create = async ({ developerName }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input('DeveloperName', sql.NVarChar(200), developerName)
    .query(`
      INSERT INTO ${TABLE} (DeveloperName, CreatedAt, UpdatedAt, IsDeleted)
      OUTPUT INSERTED.*
      VALUES (@DeveloperName, GETDATE(), GETDATE(), 0)
    `);
  return result.recordset[0];
};

const findAll = async ({ page, limit }) => {
  const pool = getPool();
  const offset = (page - 1) * limit;

  const result = await pool
    .request()
    .input('Offset', sql.Int, offset)
    .input('Limit', sql.Int, limit)
    .query(`
      SELECT * FROM (
        SELECT *, ROW_NUMBER() OVER (ORDER BY CreatedAt DESC) AS RowNum
        FROM ${TABLE}
        WHERE IsDeleted = 0
      ) AS Sub
      WHERE RowNum > @Offset AND RowNum <= (@Offset + @Limit)
      ORDER BY RowNum
    `);

  const countResult = await pool
    .request()
    .query(`SELECT COUNT(*) AS total FROM ${TABLE} WHERE IsDeleted = 0`);

  return {
    rows: result.recordset,
    total: countResult.recordset[0].total,
  };
};

const findById = async (developerId) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input('DeveloperId', sql.Int, developerId)
    .query(`
      SELECT * FROM ${TABLE}
      WHERE DeveloperId = @DeveloperId AND IsDeleted = 0
    `);
  return result.recordset[0];
};

const findByName = async (developerName) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input('DeveloperName', sql.NVarChar(200), developerName)
    .query(`
      SELECT * FROM ${TABLE}
      WHERE DeveloperName = @DeveloperName AND IsDeleted = 0
    `);
  return result.recordset[0];
};

const findOrCreateByName = async (developerName) => {
  const trimmedName = (developerName || '').trim();
  const existing = await findByName(trimmedName);
  if (existing) {
    return existing;
  }
  return create({ developerName: trimmedName });
};

const update = async (developerId, { developerName }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input('DeveloperId', sql.Int, developerId)
    .input('DeveloperName', sql.NVarChar(200), developerName)
    .query(`
      UPDATE ${TABLE}
      SET DeveloperName = @DeveloperName,
          UpdatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE DeveloperId = @DeveloperId AND IsDeleted = 0
    `);
  return result.recordset[0];
};

const softDelete = async (developerId) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input('DeveloperId', sql.Int, developerId)
    .query(`
      UPDATE ${TABLE}
      SET IsDeleted = 1, UpdatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE DeveloperId = @DeveloperId AND IsDeleted = 0
    `);
  return result.recordset[0];
};

module.exports = {
  create,
  findAll,
  findById,
  findByName,
  findOrCreateByName,
  update,
  softDelete,
};