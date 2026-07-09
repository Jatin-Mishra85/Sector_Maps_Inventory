const { getPool, sql } = require('../database/connection');

const TABLE = 'Sectors';

const create = async ({ developerId, sectorName, description }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input('DeveloperId', sql.Int, developerId)
    .input('SectorName', sql.NVarChar(200), sectorName)
    .input('Description', sql.NVarChar(sql.MAX), description || null)
    .query(`
      INSERT INTO ${TABLE} (DeveloperId, SectorName, Description, CreatedAt, UpdatedAt, IsDeleted)
      OUTPUT INSERTED.*
      VALUES (@DeveloperId, @SectorName, @Description, GETDATE(), GETDATE(), 0)
    `);
  return result.recordset[0];
};

const findAll = async ({ page, limit, developerId }) => {
  const pool = getPool();
  const offset = (page - 1) * limit;

  const request = pool
    .request()
    .input('Offset', sql.Int, offset)
    .input('Limit', sql.Int, limit);

  let whereClause = 'WHERE s.IsDeleted = 0';
  if (developerId) {
    request.input('DeveloperId', sql.Int, developerId);
    whereClause += ' AND s.DeveloperId = @DeveloperId';
  }

  const result = await request.query(`
    SELECT s.*, d.DeveloperName
    FROM ${TABLE} s
    INNER JOIN Developers d ON d.DeveloperId = s.DeveloperId
    ${whereClause}
    ORDER BY s.CreatedAt DESC
    OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
  `);

  const countRequest = pool.request();
  if (developerId) {
    countRequest.input('DeveloperId', sql.Int, developerId);
  }
  const countResult = await countRequest.query(`
    SELECT COUNT(*) AS total FROM ${TABLE} s ${whereClause}
  `);

  return {
    rows: result.recordset,
    total: countResult.recordset[0].total,
  };
};

const findById = async (sectorId) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input('SectorId', sql.Int, sectorId)
    .query(`
      SELECT s.*, d.DeveloperName
      FROM ${TABLE} s
      INNER JOIN Developers d ON d.DeveloperId = s.DeveloperId
      WHERE s.SectorId = @SectorId AND s.IsDeleted = 0
    `);
  return result.recordset[0];
};

const update = async (sectorId, { sectorName, description }) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input('SectorId', sql.Int, sectorId)
    .input('SectorName', sql.NVarChar(200), sectorName)
    .input('Description', sql.NVarChar(sql.MAX), description || null)
    .query(`
      UPDATE ${TABLE}
      SET SectorName = @SectorName,
          Description = @Description,
          UpdatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE SectorId = @SectorId AND IsDeleted = 0
    `);
  return result.recordset[0];
};

const softDelete = async (sectorId) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input('SectorId', sql.Int, sectorId)
    .query(`
      UPDATE ${TABLE}
      SET IsDeleted = 1, UpdatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE SectorId = @SectorId AND IsDeleted = 0
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