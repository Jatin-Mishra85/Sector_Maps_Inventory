const { getPool, sql } = require('../database/connection');

const TABLE = 'Sectors';

const create = async ({ developerId, sectorName }) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('DeveloperId', sql.Int, developerId)
    .input('SectorName', sql.NVarChar(200), sectorName)
    .query(`
      INSERT INTO ${TABLE} (DeveloperId, SectorName, CreatedAt, UpdatedAt, IsDeleted)
      OUTPUT INSERTED.*
      VALUES (@DeveloperId, @SectorName, GETDATE(), GETDATE(), 0)
    `);
  return result.recordset[0];
};

const findAll = async ({ page, limit, developerId }) => {
  const pool = await getPool();
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
    SELECT * FROM (
      SELECT s.*, g.GroupName,
             ROW_NUMBER() OVER (ORDER BY s.CreatedAt DESC) AS RowNum
      FROM ${TABLE} s
      INNER JOIN Groups g ON g.GroupId = s.DeveloperId
      ${whereClause}
    ) AS Sub
    WHERE RowNum > @Offset AND RowNum <= (@Offset + @Limit)
    ORDER BY RowNum
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
  const pool = await getPool();
  const result = await pool
    .request()
    .input('SectorId', sql.Int, sectorId)
    .query(`
      SELECT s.*, g.GroupName
      FROM ${TABLE} s
      INNER JOIN Groups g ON g.GroupId = s.DeveloperId
      WHERE s.SectorId = @SectorId AND s.IsDeleted = 0
    `);
  return result.recordset[0];
};

const findByNameAndDeveloper = async (sectorName, developerId) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('SectorName', sql.NVarChar(200), sectorName)
    .input('DeveloperId', sql.Int, developerId)
    .query(`
      SELECT * FROM ${TABLE}
      WHERE SectorName = @SectorName AND DeveloperId = @DeveloperId AND IsDeleted = 0
    `);
  return result.recordset[0];
};

const findOrCreateByName = async (sectorName, developerId) => {
  const trimmedName = (sectorName || '').trim();
  const existing = await findByNameAndDeveloper(trimmedName, developerId);
  if (existing) {
    return existing;
  }
  return create({ developerId, sectorName: trimmedName });
};

const update = async (sectorId, { sectorName }) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('SectorId', sql.Int, sectorId)
    .input('SectorName', sql.NVarChar(200), sectorName)
    .query(`
      UPDATE ${TABLE}
      SET SectorName = @SectorName,
          UpdatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE SectorId = @SectorId AND IsDeleted = 0
    `);
  return result.recordset[0];
};

const softDelete = async (sectorId) => {
  const pool = await getPool();
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
  findByNameAndDeveloper,
  findOrCreateByName,
  update,
  softDelete,
};