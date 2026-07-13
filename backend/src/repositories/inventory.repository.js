const { getPool, sql } = require('../database/connection');

const TABLE = 'Inventories';

const INVENTORY_COLUMNS = `
  i.InventoryId,
  i.SectorId,
  i.InventoryName,
  i.Block,
  i.InventoryDeveloperName,
  i.Description,
  i.ImageUrl,
  i.GoogleMapUrl,
  i.GoogleMapPolygon,
  i.CreatedAt,
  i.UpdatedAt,
  i.IsDeleted
`;

const attachGroups = async (rows) => {
  if (!rows.length) return rows;

  const pool = await getPool();
  const inventoryIds = rows.map((r) => r.InventoryId);

  const request = pool.request();
  const idParams = inventoryIds.map((id, idx) => {
    const paramName = `InvId${idx}`;
    request.input(paramName, sql.Int, id);
    return `@${paramName}`;
  });

  const result = await request.query(`
    SELECT ig.InventoryId, g.GroupId, g.GroupName
    FROM InventoryGroups ig
    INNER JOIN Groups g ON g.GroupId = ig.GroupId AND g.IsDeleted = 0
    WHERE ig.InventoryId IN (${idParams.join(', ')})
  `);

  const groupsByInventoryId = new Map();
  for (const r of result.recordset) {
    if (!groupsByInventoryId.has(r.InventoryId)) {
      groupsByInventoryId.set(r.InventoryId, []);
    }
    groupsByInventoryId.get(r.InventoryId).push({ groupId: r.GroupId, groupName: r.GroupName });
  }

  return rows.map((row) => ({
    ...row,
    Groups: groupsByInventoryId.get(row.InventoryId) || [],
  }));
};

const insertInventoryGroups = async (transactionOrPool, inventoryId, groupIds) => {
  if (!groupIds || !groupIds.length) return;
  for (const groupId of groupIds) {
    await transactionOrPool
      .request()
      .input('InventoryId', sql.Int, inventoryId)
      .input('GroupId', sql.Int, groupId)
      .query(`
        INSERT INTO InventoryGroups (InventoryId, GroupId)
        VALUES (@InventoryId, @GroupId)
      `);
  }
};

const create = async ({
  sectorId,
  groupIds,
  inventoryName,
  block,
  inventoryDeveloperName,
  description,
  imageUrl,
  googleMapUrl,
  googleMapPolygon,
}) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('SectorId', sql.Int, sectorId)
    .input('InventoryName', sql.NVarChar(200), inventoryName)
    .input('Block', sql.NVarChar(200), block || null)
    .input('InventoryDeveloperName', sql.NVarChar(200), inventoryDeveloperName || null)
    .input('Description', sql.NVarChar(sql.MAX), description || null)
    .input('ImageUrl', sql.NVarChar(500), imageUrl || null)
    .input('GoogleMapUrl', sql.NVarChar(500), googleMapUrl || null)
    .input('GoogleMapPolygon', sql.NVarChar(sql.MAX), googleMapPolygon || null)
    .query(`
      INSERT INTO ${TABLE}
        (SectorId, InventoryName, Block, InventoryDeveloperName, Description, ImageUrl, GoogleMapUrl, GoogleMapPolygon, CreatedAt, UpdatedAt, IsDeleted)
      OUTPUT INSERTED.*
      VALUES
        (@SectorId, @InventoryName, @Block, @InventoryDeveloperName, @Description, @ImageUrl, @GoogleMapUrl, @GoogleMapPolygon, GETDATE(), GETDATE(), 0)
    `);

  const inserted = result.recordset[0];
  await insertInventoryGroups(pool, inserted.InventoryId, groupIds);

  const [withGroups] = await attachGroups([inserted]);
  return withGroups;
};

const findAll = async ({ page, limit, groupId, sectorId }) => {
  const pool = await getPool();
  const offset = (page - 1) * limit;

  const request = pool
    .request()
    .input('Offset', sql.Int, offset)
    .input('Limit', sql.Int, limit);

  const conditions = ['i.IsDeleted = 0'];

  if (groupId) {
    request.input('GroupId', sql.Int, groupId);
    conditions.push(`EXISTS (
      SELECT 1 FROM InventoryGroups ig
      WHERE ig.InventoryId = i.InventoryId AND ig.GroupId = @GroupId
    )`);
  }
  if (sectorId) {
    request.input('SectorId', sql.Int, sectorId);
    conditions.push('i.SectorId = @SectorId');
  }

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const result = await request.query(`
    SELECT * FROM (
      SELECT ${INVENTORY_COLUMNS}, s.SectorName,
             ROW_NUMBER() OVER (ORDER BY i.CreatedAt DESC) AS RowNum
      FROM ${TABLE} i
      INNER JOIN Sectors s ON s.SectorId = i.SectorId
      ${whereClause}
    ) AS Sub
    WHERE RowNum > @Offset AND RowNum <= (@Offset + @Limit)
    ORDER BY RowNum
  `);

  const countRequest = pool.request();
  if (groupId) countRequest.input('GroupId', sql.Int, groupId);
  if (sectorId) countRequest.input('SectorId', sql.Int, sectorId);

  const countResult = await countRequest.query(`
    SELECT COUNT(*) AS total FROM ${TABLE} i ${whereClause}
  `);

  const rowsWithGroups = await attachGroups(result.recordset);

  return {
    rows: rowsWithGroups,
    total: countResult.recordset[0].total,
  };
};

const findById = async (inventoryId) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('InventoryId', sql.Int, inventoryId)
    .query(`
      SELECT ${INVENTORY_COLUMNS}, s.SectorName
      FROM ${TABLE} i
      INNER JOIN Sectors s ON s.SectorId = i.SectorId
      WHERE i.InventoryId = @InventoryId AND i.IsDeleted = 0
    `);

  if (!result.recordset[0]) return undefined;

  const [withGroups] = await attachGroups(result.recordset);
  return withGroups;
};

const update = async (
  inventoryId,
  { sectorId, groupIds, inventoryName, block, inventoryDeveloperName, description, imageUrl, googleMapUrl, googleMapPolygon }
) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('InventoryId', sql.Int, inventoryId)
    .input('SectorId', sql.Int, sectorId)
    .input('InventoryName', sql.NVarChar(200), inventoryName)
    .input('Block', sql.NVarChar(200), block || null)
    .input('InventoryDeveloperName', sql.NVarChar(200), inventoryDeveloperName || null)
    .input('Description', sql.NVarChar(sql.MAX), description || null)
    .input('ImageUrl', sql.NVarChar(500), imageUrl || null)
    .input('GoogleMapUrl', sql.NVarChar(500), googleMapUrl || null)
    .input('GoogleMapPolygon', sql.NVarChar(sql.MAX), googleMapPolygon || null)
    .query(`
      UPDATE ${TABLE}
      SET SectorId = @SectorId,
          InventoryName = @InventoryName,
          Block = @Block,
          InventoryDeveloperName = @InventoryDeveloperName,
          Description = @Description,
          ImageUrl = @ImageUrl,
          GoogleMapUrl = @GoogleMapUrl,
          GoogleMapPolygon = @GoogleMapPolygon,
          UpdatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE InventoryId = @InventoryId AND IsDeleted = 0
    `);

  const updated = result.recordset[0];
  if (!updated) return undefined;

  if (groupIds !== undefined) {
    await pool
      .request()
      .input('InventoryId', sql.Int, inventoryId)
      .query(`DELETE FROM InventoryGroups WHERE InventoryId = @InventoryId`);

    await insertInventoryGroups(pool, inventoryId, groupIds);
  }

  const [withGroups] = await attachGroups([updated]);
  return withGroups;
};

const softDelete = async (inventoryId) => {
  const pool = await getPool();
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

const hardDelete = async (inventoryId) => {
  const pool = await getPool();
  await pool
    .request()
    .input('InventoryId', sql.Int, inventoryId)
    .query(`DELETE FROM InventoryGroups WHERE InventoryId = @InventoryId`);

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

const search = async ({ keyword, page, limit }) => {
  const pool = await getPool();
  const offset = (page - 1) * limit;
  const likeKeyword = `%${keyword || ''}%`;

  const request = pool
    .request()
    .input('Keyword', sql.NVarChar(200), likeKeyword)
    .input('Offset', sql.Int, offset)
    .input('Limit', sql.Int, limit);

  const conditions = [
    'i.IsDeleted = 0',
    `(
      EXISTS (
        SELECT 1 FROM InventoryGroups ig
        INNER JOIN Groups g ON g.GroupId = ig.GroupId AND g.IsDeleted = 0
        WHERE ig.InventoryId = i.InventoryId AND g.GroupName LIKE @Keyword
      )
      OR s.SectorName LIKE @Keyword
      OR i.InventoryName LIKE @Keyword
      OR i.Block LIKE @Keyword
      OR i.InventoryDeveloperName LIKE @Keyword
    )`,
  ];

  const whereClause = `WHERE ${conditions.join(' AND ')}`;

  const result = await request.query(`
    SELECT * FROM (
      SELECT ${INVENTORY_COLUMNS}, s.SectorName,
             ROW_NUMBER() OVER (ORDER BY i.CreatedAt DESC) AS RowNum
      FROM ${TABLE} i
      INNER JOIN Sectors s ON s.SectorId = i.SectorId
      ${whereClause}
    ) AS Sub
    WHERE RowNum > @Offset AND RowNum <= (@Offset + @Limit)
    ORDER BY RowNum
  `);

  const countRequest = pool.request().input('Keyword', sql.NVarChar(200), likeKeyword);
  const countResult = await countRequest.query(`
    SELECT COUNT(*) AS total
    FROM ${TABLE} i
    INNER JOIN Sectors s ON s.SectorId = i.SectorId
    ${whereClause}
  `);

  const rowsWithGroups = await attachGroups(result.recordset);

  return {
    rows: rowsWithGroups,
    total: countResult.recordset[0].total,
  };
};

const suggest = async ({ keyword, limitPerCategory = 5 }) => {
  const pool = await getPool();
  const likeKeyword = `%${keyword || ''}%`;

  const request = pool
    .request()
    .input('Keyword', sql.NVarChar(200), likeKeyword)
    .input('LimitPerCategory', sql.Int, limitPerCategory);

  const result = await request.query(`
    SELECT TOP (@LimitPerCategory) GroupName AS label, 'GROUPING' AS category
    FROM Groups
    WHERE IsDeleted = 0 AND GroupName LIKE @Keyword

    UNION ALL

    SELECT TOP (@LimitPerCategory) SectorName AS label, 'SECTOR' AS category
    FROM Sectors
    WHERE IsDeleted = 0 AND SectorName LIKE @Keyword

    UNION ALL

    SELECT TOP (@LimitPerCategory) InventoryName AS label, 'PROJECT' AS category
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