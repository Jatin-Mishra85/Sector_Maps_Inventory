// backend/src/repositories/group.repository.js
// Note: table is "Groups" (plural) to avoid GROUP being a reserved SQL keyword.
const { getPool, sql } = require('../database/connection');

async function getAll() {
    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT
            g.GroupId,
            g.GroupName,
            g.CreatedAt,
            COUNT(ig.InventoryId) AS inventoryCount
        FROM Groups g
        LEFT JOIN InventoryGroups ig ON ig.GroupId = g.GroupId
        GROUP BY g.GroupId, g.GroupName, g.CreatedAt
        ORDER BY g.GroupId
    `);
    return result.recordset;
}

async function getById(groupId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('GroupId', sql.Int, groupId)
        .query('SELECT * FROM Groups WHERE GroupId = @GroupId');
    return result.recordset[0] || null;
}

async function getByName(groupName) {
    const pool = await getPool();
    const result = await pool.request()
        .input('GroupName', sql.NVarChar(255), groupName)
        .query('SELECT * FROM Groups WHERE GroupName = @GroupName');
    return result.recordset[0] || null;
}

async function create(groupName) {
    const pool = await getPool();
    const result = await pool.request()
        .input('GroupName', sql.NVarChar(255), groupName)
        .query(`
            INSERT INTO Groups (GroupName)
            OUTPUT INSERTED.*
            VALUES (@GroupName)
        `);
    return result.recordset[0];
}

// Naam se group dhoondo; agar nahi mila to naya bana do.
async function findOrCreateByName(groupName) {
    const existing = await getByName(groupName);
    if (existing) {
        console.log('[DEBUG] Found existing group:', existing);
        return existing;
    }
    const created = await create(groupName);
    console.log('[DEBUG] Newly created group:', created);
    return created;
}

async function update(groupId, groupName) {
    const pool = await getPool();
    const result = await pool.request()
        .input('GroupId', sql.Int, groupId)
        .input('GroupName', sql.NVarChar(255), groupName)
        .query(`
            UPDATE Groups
            SET GroupName = @GroupName
            OUTPUT INSERTED.*
            WHERE GroupId = @GroupId
        `);
    return result.recordset[0] || null;
}

async function remove(groupId) {
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // Pehle junction table (InventoryGroups) se saare related rows hatao,
        // warna FK_InventoryGroups_Group constraint delete ko block karega.
        await new sql.Request(transaction)
            .input('GroupId', sql.Int, groupId)
            .query('DELETE FROM InventoryGroups WHERE GroupId = @GroupId');

        // Ab Groups table se group delete karo.
        const result = await new sql.Request(transaction)
            .input('GroupId', sql.Int, groupId)
            .query('DELETE FROM Groups WHERE GroupId = @GroupId');

        await transaction.commit();
        return result.rowsAffected[0] > 0;
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
}

async function addInventoriesToGroup(groupId, inventoryIds) {
    const pool = await getPool();
    const results = [];
    for (const inventoryId of inventoryIds) {
        const result = await pool.request()
            .input('GroupId', sql.Int, groupId)
            .input('InventoryId', sql.Int, inventoryId)
            .query(`
                IF NOT EXISTS (
                    SELECT 1 FROM InventoryGroups
                    WHERE GroupId = @GroupId AND InventoryId = @InventoryId
                )
                INSERT INTO InventoryGroups (GroupId, InventoryId)
                OUTPUT INSERTED.*
                VALUES (@GroupId, @InventoryId)
            `);
        if (result.recordset[0]) results.push(result.recordset[0]);
    }
    return results;
}

async function removeInventoriesFromGroup(groupId, inventoryIds) {
    const pool = await getPool();
    const request = pool.request().input('GroupId', sql.Int, groupId);
    const params = inventoryIds.map((id, i) => {
        request.input(`InvId${i}`, sql.Int, id);
        return `@InvId${i}`;
    });
    const result = await request.query(`
        DELETE FROM InventoryGroups
        WHERE GroupId = @GroupId AND InventoryId IN (${params.join(',')})
    `);
    return result.rowsAffected[0];
}

module.exports = {
    getAll,
    getById,
    getByName,
    create,
    findOrCreateByName,
    update,
    remove,
    addInventoriesToGroup,
    removeInventoriesFromGroup,
};