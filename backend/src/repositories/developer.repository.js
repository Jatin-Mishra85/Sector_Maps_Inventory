const { getPool, sql } = require('../database/connection');

const TABLE = 'Developers';

const create = async ({ developerName, description }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input('DeveloperName', sql.NVarChar(200), developerName)
    .input('Description', sql.NVarChar(sql.MAX), description || null)
    .query(`
      INSERT INTO ${TABLE} (DeveloperName, Description, CreatedAt, UpdatedAt, IsDeleted)
      OUTPUT INSERTED.*
      VALUES (@DeveloperName, @Description, GETDATE(), GETDATE(), 0)
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
      SELECT *
      FROM ${TABLE}
      WHERE IsDeleted = 0
      ORDER BY CreatedAt DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
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

const update = async (developerId, { developerName, description }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input('DeveloperId', sql.Int, developerId)
    .input('DeveloperName', sql.NVarChar(200), developerName)
    .input('Description', sql.NVarChar(sql.MAX), description || null)
    .query(`
      UPDATE ${TABLE}
      SET DeveloperName = @DeveloperName,
          Description = @Description,
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
  update,
  softDelete,
};