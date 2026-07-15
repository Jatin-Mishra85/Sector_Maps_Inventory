// backend/repositories/inventory.repository.js
// ⚠️ Adjust this import path to match your real db connection file.
// ⚠️ Price/AreaSqFt/UnitType/Status/Description are PLACEHOLDER fields —
//    replace with your real Inventory columns once confirmed.
const { getPool, sql } = require('../database/connection');

async function getAll() {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM Inventory ORDER BY DisplaySequence');
    return result.recordset;
}

async function getById(inventoryId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('InventoryId', sql.Int, inventoryId)
        .query('SELECT * FROM Inventory WHERE InventoryId = @InventoryId');
    return result.recordset[0] || null;
}

async function create(data) {
    const pool = await getPool();
    const result = await pool.request()
        .input('DeveloperId', sql.Int, data.developerId || null)
        .input('SectorId', sql.Int, data.sectorId || null)
        .input('ProjectId', sql.Int, data.projectId || null)
        .input('ImageId', sql.Int, data.imageId || null)
        .input('DisplaySequence', sql.Decimal(10, 2), data.displaySequence)
        .input('Price', sql.Decimal(18, 2), data.price || null)
        .input('AreaSqFt', sql.Decimal(10, 2), data.areaSqFt || null)
        .input('UnitType', sql.NVarChar(255), data.unitType || null)
        .input('Status', sql.NVarChar(255), data.status || null)
        .input('Description', sql.NVarChar(sql.MAX), data.description || null)
        .query(`
            INSERT INTO Inventory
                (DeveloperId, SectorId, ProjectId, ImageId, DisplaySequence, Price, AreaSqFt, UnitType, Status, Description)
            OUTPUT INSERTED.*
            VALUES
                (@DeveloperId, @SectorId, @ProjectId, @ImageId, @DisplaySequence, @Price, @AreaSqFt, @UnitType, @Status, @Description)
        `);
    return result.recordset[0];
}

async function update(inventoryId, data) {
    const pool = await getPool();
    const result = await pool.request()
        .input('InventoryId', sql.Int, inventoryId)
        .input('DeveloperId', sql.Int, data.developerId || null)
        .input('SectorId', sql.Int, data.sectorId || null)
        .input('ProjectId', sql.Int, data.projectId || null)
        .input('ImageId', sql.Int, data.imageId || null)
        .input('DisplaySequence', sql.Decimal(10, 2), data.displaySequence)
        .input('Price', sql.Decimal(18, 2), data.price || null)
        .input('AreaSqFt', sql.Decimal(10, 2), data.areaSqFt || null)
        .input('UnitType', sql.NVarChar(255), data.unitType || null)
        .input('Status', sql.NVarChar(255), data.status || null)
        .input('Description', sql.NVarChar(sql.MAX), data.description || null)
        .query(`
            UPDATE Inventory
            SET DeveloperId = @DeveloperId,
                SectorId = @SectorId,
                ProjectId = @ProjectId,
                ImageId = @ImageId,
                DisplaySequence = @DisplaySequence,
                Price = @Price,
                AreaSqFt = @AreaSqFt,
                UnitType = @UnitType,
                Status = @Status,
                Description = @Description
            OUTPUT INSERTED.*
            WHERE InventoryId = @InventoryId
        `);
    return result.recordset[0] || null;
}

async function remove(inventoryId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('InventoryId', sql.Int, inventoryId)
        .query('DELETE FROM Inventory WHERE InventoryId = @InventoryId');
    return result.rowsAffected[0] > 0;
}

module.exports = { getAll, getById, create, update, remove };