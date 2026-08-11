// backend/src/repositories/interactions.repository.js
const { getPool, sql } = require('../database/connection');

// ---- SAVE ----

// Ek inventory ko user ke liye "save" karo. Agar already saved hai
// (UNIQUE constraint ki wajah se), to chup-chaap ignore kar do — error mat do.
async function saveInventory(userId, inventoryId) {
    const pool = await getPool();
    try {
        await pool.request()
            .input('UserId', sql.Int, userId)
            .input('InventoryId', sql.Int, inventoryId)
            .query('INSERT INTO SavedInventories (UserId, InventoryId) VALUES (@UserId, @InventoryId)');
    } catch (err) {
        // Error number 2627 / 2601 = SQL Server ka "UNIQUE constraint violation".
        // Matlab already saved hai — ye normal hai, error nahi maanna.
        if (err.number === 2627 || err.number === 2601) return;
        throw err;
    }
}

async function unsaveInventory(userId, inventoryId) {
    const pool = await getPool();
    await pool.request()
        .input('UserId', sql.Int, userId)
        .input('InventoryId', sql.Int, inventoryId)
        .query('DELETE FROM SavedInventories WHERE UserId = @UserId AND InventoryId = @InventoryId');
}

// Logged-in user ke saare saved InventoryIds ki list (sirf IDs, fast lookup ke liye).
async function getSavedInventoryIds(userId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('UserId', sql.Int, userId)
        .query('SELECT InventoryId FROM SavedInventories WHERE UserId = @UserId');
    return result.recordset.map((row) => row.InventoryId);
}

// ---- REPORT ----

async function reportInventory(userId, inventoryId, reason, details) {
    const pool = await getPool();
    await pool.request()
        .input('UserId', sql.Int, userId)
        .input('InventoryId', sql.Int, inventoryId)
        .input('Reason', sql.NVarChar(50), reason)
        .input('Details', sql.NVarChar(500), details)
        .query('INSERT INTO ReportedInventories (UserId, InventoryId, Reason, Details) VALUES (@UserId, @InventoryId, @Reason, @Details)');
}

async function getAllReports() {
    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT r.ReportId, r.ReportedAt, r.Reason, r.Details, u.Name AS UserName, u.Email AS UserEmail
        FROM ReportedInventories r
        LEFT JOIN Users u ON u.UserId = r.UserId
        ORDER BY r.ReportedAt DESC
    `);
    return result.recordset;
}

module.exports = {
    saveInventory,
    unsaveInventory,
    getSavedInventoryIds,
    reportInventory,
    getAllReports,
};