const { getPool, sql } = require('../database/connection');

const TABLE = 'Groups';

const create = async ({ groupName }) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('GroupName', sql.NVarChar(200), groupName)
    .query(`
      INSERT INTO ${TABLE} (GroupName, CreatedAt, UpdatedAt, IsDeleted)
      OUTPUT INSERTED.*
      VALUES (@GroupName, GETDATE(), GETDATE(), 0)
    `);
  return result.recordset[0];
};



const findAll = async ({ page, limit } = {}) => {
  const pool = await getPool();

  if (!page || !limit) {
    const result = await pool.request().query(`
      SELECT g.*, COUNT(ig.InventoryId) AS InventoryCount
      FROM ${TABLE} g
      LEFT JOIN InventoryGroups ig ON ig.GroupId = g.GroupId
      LEFT JOIN Inventories i ON i.InventoryId = ig.InventoryId AND i.IsDeleted = 0
      WHERE g.IsDeleted = 0
      GROUP BY g.GroupId, g.GroupName, g.CreatedAt, g.UpdatedAt, g.IsDeleted
      ORDER BY g.GroupName ASC
    `);
    return { rows: result.recordset, total: result.recordset.length };
  }

  const offset = (page - 1) * limit;
  const result = await pool
    .request()
    .input('Offset', sql.Int, offset)
    .input('Limit', sql.Int, limit)
    .query(`
      SELECT * FROM (
        SELECT g.*, COUNT(ig.InventoryId) AS InventoryCount,
               ROW_NUMBER() OVER (ORDER BY g.CreatedAt DESC) AS RowNum
        FROM ${TABLE} g
        LEFT JOIN InventoryGroups ig ON ig.GroupId = g.GroupId
        LEFT JOIN Inventories i ON i.InventoryId = ig.InventoryId AND i.IsDeleted = 0
        WHERE g.IsDeleted = 0
        GROUP BY g.GroupId, g.GroupName, g.CreatedAt, g.UpdatedAt, g.IsDeleted
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

const findById = async (groupId) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('GroupId', sql.Int, groupId)
    .query(`
      SELECT * FROM ${TABLE}
      WHERE GroupId = @GroupId AND IsDeleted = 0
    `);
  return result.recordset[0];
};

const findByName = async (groupName) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('GroupName', sql.NVarChar(200), groupName)
    .query(`
      SELECT * FROM ${TABLE}
      WHERE GroupName = @GroupName AND IsDeleted = 0
    `);
  return result.recordset[0];
};

const findOrCreateByName = async (groupName) => {
  const trimmedName = (groupName || '').trim();
  const existing = await findByName(trimmedName);
  if (existing) {
    return existing;
  }
  return create({ groupName: trimmedName });
};

const update = async (groupId, { groupName }) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('GroupId', sql.Int, groupId)
    .input('GroupName', sql.NVarChar(200), groupName)
    .query(`
      UPDATE ${TABLE}
      SET GroupName = @GroupName,
          UpdatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE GroupId = @GroupId AND IsDeleted = 0
    `);
  return result.recordset[0];
};

const softDelete = async (groupId) => {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('GroupId', sql.Int, groupId)
    .query(`
      UPDATE ${TABLE}
      SET IsDeleted = 1, UpdatedAt = GETDATE()
      OUTPUT INSERTED.*
      WHERE GroupId = @GroupId AND IsDeleted = 0
    `);
  return result.recordset[0];
};

// Bulk-adds a set of InventoryIds to a Group. Skips any that are already
// linked (no duplicate rows). Returns how many were actually added.
const addInventoriesToGroup = async (groupId, inventoryIds) => {
  const pool = await getPool();
  const uniqueIds = [...new Set((inventoryIds || []).filter(Boolean))];
  let addedCount = 0;

  for (const inventoryId of uniqueIds) {
    const exists = await pool
      .request()
      .input('InventoryId', sql.Int, inventoryId)
      .input('GroupId', sql.Int, groupId)
      .query(`SELECT 1 FROM InventoryGroups WHERE InventoryId = @InventoryId AND GroupId = @GroupId`);

    if (exists.recordset.length === 0) {
      await pool
        .request()
        .input('InventoryId', sql.Int, inventoryId)
        .input('GroupId', sql.Int, groupId)
        .query(`INSERT INTO InventoryGroups (InventoryId, GroupId) VALUES (@InventoryId, @GroupId)`);
      addedCount += 1;
    }
  }

  return addedCount;
};

// Bulk-removes a set of InventoryIds from a Group. Returns how many rows were removed.
const removeInventoriesFromGroup = async (groupId, inventoryIds) => {
  const pool = await getPool();
  const uniqueIds = [...new Set((inventoryIds || []).filter(Boolean))];
  if (uniqueIds.length === 0) return 0;

  const request = pool.request().input('GroupId', sql.Int, groupId);
  const idParams = uniqueIds.map((id, idx) => {
    const paramName = `InvId${idx}`;
    request.input(paramName, sql.Int, id);
    return `@${paramName}`;
  });

  const result = await request.query(`
    DELETE FROM InventoryGroups
    WHERE GroupId = @GroupId AND InventoryId IN (${idParams.join(', ')})
  `);
  return result.rowsAffected[0];
};

module.exports = {
  create,
  findAll,
  findById,
  findByName,
  findOrCreateByName,
  update,
  softDelete,
  addInventoriesToGroup,      // NEW
  removeInventoriesFromGroup, // NEW
};