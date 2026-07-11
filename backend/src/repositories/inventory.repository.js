const { getPool, sql } = require('../database/connection');

const TABLE = 'Inventories'; // FIXED — was 'Inventories', which caused the 1-record bug

const create = async ({
  developerId,
  sectorId,
  inventoryType,
  inventoryName,
  description,
  imageUrl,
  googleMapUrl,
  googleMapPolygon,
}) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input('DeveloperId', sql.Int, developerId)
    .input('SectorId', sql.Int, sectorId)
    .input('InventoryType', sql.NVarChar(20), inventoryType)
    .input('InventoryName', sql.NVarChar(200), inventoryName)
    .input('Description', sql.NVarChar(sql.MAX), description || null)
    .input('ImageUrl', sql.NVarChar(500), imageUrl || null)
    .input('GoogleMapUrl', sql.NVarChar(500), googleMapUrl || null)
    .input('GoogleMapPolygon', sql.NVarChar(sql.MAX), googleMapPolygon || null)
    .query(`
      INSERT INTO ${TABLE}
        (DeveloperId, SectorId, InventoryType, InventoryName, Description, ImageUrl, GoogleMapUrl, GoogleMapPolygon, CreatedAt, UpdatedAt, IsDeleted)
      OUTPUT INSERTED.*
      VALUES
        (@DeveloperId, @SectorId, @InventoryType, @InventoryName, @Description, @ImageUrl, @GoogleMapUrl, @GoogleMapPolygon, GETDATE(), GETDATE(), 0)
    `);
  return result.recordset[0];
};

const findAll = async ({ page, limit, developerId, sectorId, inventoryType }) => {
  const pool = getPool();
  const offset = (page - 1) * limit;

  const request = pool
    .request()
    .input('Offset', sql.Int, offset)
    .input('Limit', sql.Int, limit);

  const conditions = ['i.IsDeleted = 0'];

  if (developerId) {
    request.input('DeveloperId', sql.Int, developerId);
    conditions.push('i.DeveloperId = @DeveloperId');
  }
  if (sectorId) {
    request.input('SectorId', sql.Int, sectorId);
    conditions.push('i.SectorId = @SectorId');
  }
  if (inventoryType) {
    request.input('InventoryType', sql.NVarChar(20), inventoryType);
    conditions.push('i.InventoryType = @InventoryType');
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const result = await request.query(`
    SELECT * FROM (
      SELECT i.*, d.DeveloperName, s.SectorName,
             ROW_NUMBER() OVER (ORDER BY i.CreatedAt DESC) AS RowNum
      FROM ${TABLE} i
      INNER JOIN Developers d ON d.DeveloperId = i.DeveloperId
      INNER JOIN Sectors s ON s.SectorId = i.SectorId
      ${whereClause}
    ) AS Sub
    WHERE RowNum > @Offset AND RowNum <= (@Offset + @Limit)
    ORDER BY RowNum
  `);

  const countRequest = pool.request();
  if (developerId) countRequest.input('DeveloperId', sql.Int, developerId);
  if (sectorId) countRequest.input('SectorId', sql.Int, sectorId);
  if (inventoryType) countRequest.input('InventoryType', sql.NVarChar(20), inventoryType);

  const countResult = await countRequest.query(`
    SELECT COUNT(*) AS total FROM ${TABLE} i ${whereClause}
  `);

  return {
    rows: result.recordset,
    total: countResult.recordset[0].total,
  };
};

const findById = async (inventoryId) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input('InventoryId', sql.Int, inventoryId)
    .query(`
      SELECT i.*, d.DeveloperName, s.SectorName
      FROM ${TABLE} i
      INNER JOIN Developers d ON d.DeveloperId = i.DeveloperId
      INNER JOIN Sectors s ON s.SectorId = i.SectorId
      WHERE i.InventoryId = @InventoryId AND i.IsDeleted = 0
    `);
  return result.recordset[0];
};

const update = async (
  inventoryId,
  { sectorId, inventoryType, inventoryName, description, imageUrl, googleMapUrl, googleMapPolygon }
) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input('InventoryId', sql.Int, inventoryId)
    .input('SectorId', sql.Int, sectorId)
    .input('InventoryType', sql.NVarChar(20), inventoryType)
    .input('InventoryName', sql.NVarChar(200), inventoryName)
    .input('Description', sql.NVarChar(sql.MAX), description || null)
    .input('ImageUrl', sql.NVarChar(500), imageUrl || null)
    .input('GoogleMapUrl', sql.NVarChar(500), googleMapUrl || null)
    .input('GoogleMapPolygon', sql.NVarChar(sql.MAX), googleMapPolygon || null)
    .query(`
      UPDATE ${TABLE}
      SET SectorId = @SectorId,
          InventoryType = @InventoryType,
          InventoryName = @InventoryName,
          Description = @Description,
          ImageUrl = @ImageUrl,
          GoogleMapUrl = @GoogleMapUrl,
          GoogleMapPolygon = @GoogleMapPolygon,
          UpdatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE InventoryId = @InventoryId AND IsDeleted = 0
    `);
  return result.recordset[0];
};

const softDelete = async (inventoryId) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input('InventoryId', sql.Int, inventoryId)
    .query(`
      UPDATE ${TABLE}
      SET IsDeleted = 1, UpdatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE InventoryId = @InventoryId AND IsDeleted = 0
    `);
  return result.recordset[0];
};

// TEMPORARY — hard delete: permanently removes the row from the DB.
// This is ONLY for cleaning up accidentally/wrongly entered data during
// testing. Remove this function (and switch the service back to
// softDelete) once the real Admin Panel is built with proper recovery.
const hardDelete = async (inventoryId) => {
  const pool = getPool();
  const result = await pool
    .request()
    .input('InventoryId', sql.Int, inventoryId)
    .query(`
      DELETE FROM ${TABLE}
      OUTPUT DELETED.*
      WHERE InventoryId = @InventoryId
    `);
  return result.recordset[0];
};

const search = async ({ keyword, inventoryType, page, limit }) => {
  const pool = getPool();
  const offset = (page - 1) * limit;
  const likeKeyword = `%${keyword || ''}%`;

  const request = pool
    .request()
    .input('Keyword', sql.NVarChar(200), likeKeyword)
    .input('Offset', sql.Int, offset)
    .input('Limit', sql.Int, limit);

  const conditions = [
    'i.IsDeleted = 0',
    `(d.DeveloperName LIKE @Keyword
      OR s.SectorName LIKE @Keyword
      OR i.InventoryName LIKE @Keyword
      OR i.InventoryType LIKE @Keyword)`,
  ];

  if (inventoryType) {
    request.input('InventoryType', sql.NVarChar(20), inventoryType);
    conditions.push('i.InventoryType = @InventoryType');
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const result = await request.query(`
    SELECT * FROM (
      SELECT i.*, d.DeveloperName, s.SectorName,
             ROW_NUMBER() OVER (ORDER BY i.CreatedAt DESC) AS RowNum
      FROM ${TABLE} i
      INNER JOIN Developers d ON d.DeveloperId = i.DeveloperId
      INNER JOIN Sectors s ON s.SectorId = i.SectorId
      ${whereClause}
    ) AS Sub
    WHERE RowNum > @Offset AND RowNum <= (@Offset + @Limit)
    ORDER BY RowNum
  `);

  const countRequest = pool.request().input('Keyword', sql.NVarChar(200), likeKeyword);
  if (inventoryType) {
    countRequest.input('InventoryType', sql.NVarChar(20), inventoryType);
  }
  const countResult = await countRequest.query(`
    SELECT COUNT(*) AS total
    FROM ${TABLE} i
    INNER JOIN Developers d ON d.DeveloperId = i.DeveloperId
    INNER JOIN Sectors s ON s.SectorId = i.SectorId
    ${whereClause}
  `);

  return {
    rows: result.recordset,
    total: countResult.recordset[0].total,
  };
};

/**
 * Lightweight suggestions for search-as-you-type.
 */
const suggest = async ({ keyword, limitPerCategory = 5 }) => {
  const pool = getPool();
  const likeKeyword = `%${keyword || ''}%`;

  const request = pool
    .request()
    .input('Keyword', sql.NVarChar(200), likeKeyword)
    .input('LimitPerCategory', sql.Int, limitPerCategory);

  const result = await request.query(`
    SELECT TOP (@LimitPerCategory) DeveloperName AS label, 'DEVELOPER' AS category
    FROM Developers
    WHERE IsDeleted = 0 AND DeveloperName LIKE @Keyword

    UNION ALL

    SELECT TOP (@LimitPerCategory) SectorName AS label, 'SECTOR' AS category
    FROM Sectors
    WHERE IsDeleted = 0 AND SectorName LIKE @Keyword

    UNION ALL

    SELECT TOP (@LimitPerCategory) InventoryName AS label, 'INVENTORY' AS category
    FROM ${TABLE}
    WHERE IsDeleted = 0 AND InventoryName LIKE @Keyword
  `);

  return result.recordset;
};

module.exports = {
  create,
  findAll,
  findById,
  update,
  softDelete,
  hardDelete,
  search,
  suggest,
};