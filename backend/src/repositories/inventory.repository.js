// backend/repositories/inventory.repository.js
const { getPool, sql } = require('../database/connection');

// ---- Lookup helpers: naam se id dhoondo, na mile to naya row bana ke id do ----
// Agar naam khaali/blank hai, to null return karo — Developer/Sector/Project columns nullable hain,
// isliye blank Developers/Sectors/Projects rows create nahi karni.

async function findOrCreateDeveloper(developerName) {
    const name = (developerName || '').trim();
    if (!name) return null;

    const pool = await getPool();

    const existing = await pool.request()
        .input('DeveloperName', sql.NVarChar(255), name)
        .query('SELECT DeveloperId FROM Developers WHERE DeveloperName = @DeveloperName');

    if (existing.recordset[0]) return existing.recordset[0].DeveloperId;

    const inserted = await pool.request()
        .input('DeveloperName', sql.NVarChar(255), name)
        .query('INSERT INTO Developers (DeveloperName) OUTPUT INSERTED.DeveloperId VALUES (@DeveloperName)');

    return inserted.recordset[0].DeveloperId;
}

async function findOrCreateSector(sectorName) {
    const name = (sectorName || '').trim();
    if (!name) return null;

    const pool = await getPool();

    const existing = await pool.request()
        .input('SectorName', sql.NVarChar(255), name)
        .query('SELECT SectorId FROM Sectors WHERE SectorName = @SectorName');

    if (existing.recordset[0]) return existing.recordset[0].SectorId;

    const inserted = await pool.request()
        .input('SectorName', sql.NVarChar(255), name)
        .query('INSERT INTO Sectors (SectorName) OUTPUT INSERTED.SectorId VALUES (@SectorName)');

    return inserted.recordset[0].SectorId;
}

async function findOrCreateProject(projectName) {
    const name = (projectName || '').trim();
    if (!name) return null;

    const pool = await getPool();

    const existing = await pool.request()
        .input('ProjectName', sql.NVarChar(255), name)
        .query('SELECT ProjectId FROM Projects WHERE ProjectName = @ProjectName');

    if (existing.recordset[0]) return existing.recordset[0].ProjectId;

    const inserted = await pool.request()
        .input('ProjectName', sql.NVarChar(255), name)
        .query('INSERT INTO Projects (ProjectName) OUTPUT INSERTED.ProjectId VALUES (@ProjectName)');

    return inserted.recordset[0].ProjectId;
}

// ---- Card No (DisplaySequence) helpers ----

async function getMaxDisplaySequence() {
    const pool = await getPool();
    const result = await pool.request().query('SELECT MAX(DisplaySequence) AS MaxSeq FROM Inventory');
    return result.recordset[0]?.MaxSeq ?? null;
}

async function displaySequenceExists(displaySequence, excludeInventoryId = null) {
    const pool = await getPool();
    const request = pool.request().input('DisplaySequence', sql.Decimal(10, 2), displaySequence);

    let query = 'SELECT TOP 1 InventoryId FROM Inventory WHERE DisplaySequence = @DisplaySequence';
    if (excludeInventoryId) {
        request.input('ExcludeId', sql.Int, excludeInventoryId);
        query += ' AND InventoryId <> @ExcludeId';
    }

    const result = await request.query(query);
    return !!result.recordset[0];
}

async function getAll() {
    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT i.*, d.DeveloperName, s.SectorName, p.ProjectName
        FROM Inventory i
        LEFT JOIN Developers d ON d.DeveloperId = i.DeveloperId
        LEFT JOIN Sectors s ON s.SectorId = i.SectorId
        LEFT JOIN Projects p ON p.ProjectId = i.ProjectId
        ORDER BY i.DisplaySequence
    `);
    return result.recordset;
}

async function getById(inventoryId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('InventoryId', sql.Int, inventoryId)
        .query(`
            SELECT i.*, d.DeveloperName, s.SectorName, p.ProjectName
            FROM Inventory i
            LEFT JOIN Developers d ON d.DeveloperId = i.DeveloperId
            LEFT JOIN Sectors s ON s.SectorId = i.SectorId
            LEFT JOIN Projects p ON p.ProjectId = i.ProjectId
            WHERE i.InventoryId = @InventoryId
        `);
    return result.recordset[0] || null;
}

async function create(data) {
    const pool = await getPool();

    const developerId = await findOrCreateDeveloper(data.developerName);
    const sectorId = await findOrCreateSector(data.sectorName);
    const projectId = await findOrCreateProject(data.projectName);

    const result = await pool.request()
        .input('DeveloperId', sql.Int, developerId)
        .input('SectorId', sql.Int, sectorId)
        .input('ProjectId', sql.Int, projectId)
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

    const developerId = await findOrCreateDeveloper(data.developerName);
    const sectorId = await findOrCreateSector(data.sectorName);
    const projectId = await findOrCreateProject(data.projectName);

    const result = await pool.request()
        .input('InventoryId', sql.Int, inventoryId)
        .input('DeveloperId', sql.Int, developerId)
        .input('SectorId', sql.Int, sectorId)
        .input('ProjectId', sql.Int, projectId)
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

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    findOrCreateDeveloper,
    findOrCreateSector,
    findOrCreateProject,
    getMaxDisplaySequence,
    displaySequenceExists,
};