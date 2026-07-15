// backend/repositories/inventoryGroup.repository.js
// ⚠️ Adjust this import path to match your real db connection file.
const { getPool, sql } = require('../database/connection');

// All Groups attached to one Inventory item (with GroupName joined in for convenience)
async function getGroupsForInventory(inventoryId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('InventoryId', sql.Int, inventoryId)
        .query(`
            SELECT g.GroupId, g.GroupName
            FROM InventoryGroups ig
            JOIN Groups g ON g.GroupId = ig.GroupId
            WHERE ig.InventoryId = @InventoryId
        `);
    return result.recordset;
}

// All Inventory items tagged with one Group
async function getInventoryForGroup(groupId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('GroupId', sql.Int, groupId)
        .query(`
            SELECT i.*
            FROM InventoryGroups ig
            JOIN Inventory i ON i.InventoryId = ig.InventoryId
            WHERE ig.GroupId = @GroupId
        `);
    return result.recordset;
}

async function addMapping(inventoryId, groupId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('InventoryId', sql.Int, inventoryId)
        .input('GroupId', sql.Int, groupId)
        .query(`
            INSERT INTO InventoryGroups (InventoryId, GroupId)
            OUTPUT INSERTED.*
            VALUES (@InventoryId, @GroupId)
        `);
    return result.recordset[0];
}

async function removeMapping(inventoryId, groupId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('InventoryId', sql.Int, inventoryId)
        .input('GroupId', sql.Int, groupId)
        .query(`
            DELETE FROM InventoryGroups
            WHERE InventoryId = @InventoryId AND GroupId = @GroupId
        `);
    return result.rowsAffected[0] > 0;
}

module.exports = { getGroupsForInventory, getInventoryForGroup, addMapping, removeMapping };