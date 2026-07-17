// backend/src/repositories/inventory.repository.js
const { getPool, sql } = require('../database/connection');

// ---- Developer / Sector / Project lookup helpers ----
// Blank naam pe null return karo — columns nullable hain, blank rows create nahi karni.

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

// ---- Group lookup helper (find-or-create by name, same pattern) ----

async function findOrCreateGroup(groupName) {
    const name = (groupName || '').trim();
    if (!name) return null;
    const pool = await getPool();
    const existing = await pool.request()
        .input('GroupName', sql.NVarChar(255), name)
        .query('SELECT GroupId FROM Groups WHERE GroupName = @GroupName');
    if (existing.recordset[0]) return existing.recordset[0].GroupId;
    const inserted = await pool.request()
        .input('GroupName', sql.NVarChar(255), name)
        .query('INSERT INTO Groups (GroupName) OUTPUT INSERTED.GroupId VALUES (@GroupName)');
    return inserted.recordset[0].GroupId;
}

// Ek inventory ke Groups tags ko replace karo — purane sab hata ke, di gayi list dobara likho.
async function syncInventoryGroups(inventoryId, groupNames) {
    const pool = await getPool();

    await pool.request()
        .input('InventoryId', sql.Int, inventoryId)
        .query('DELETE FROM InventoryGroups WHERE InventoryId = @InventoryId');

    const names = Array.isArray(groupNames) ? groupNames.map((n) => (n || '').trim()).filter(Boolean) : [];

    for (const name of names) {
        const groupId = await findOrCreateGroup(name);
        if (!groupId) continue;
        await pool.request()
            .input('InventoryId', sql.Int, inventoryId)
            .input('GroupId', sql.Int, groupId)
            .query('INSERT INTO InventoryGroups (InventoryId, GroupId) VALUES (@InventoryId, @GroupId)');
    }
}

// Bulk fetch — ek query se saare diye gaye InventoryIds ke Groups la do (N+1 avoid karne ke liye).
async function getGroupsForInventoryIds(inventoryIds) {
    const ids = inventoryIds.map(Number).filter((n) => Number.isInteger(n));
    if (!ids.length) return {};

    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT ig.InventoryId, g.GroupId, g.GroupName
        FROM InventoryGroups ig
        JOIN Groups g ON g.GroupId = ig.GroupId
        WHERE ig.InventoryId IN (${ids.join(',')})
    `);

    const map = {};
    result.recordset.forEach((row) => {
        if (!map[row.InventoryId]) map[row.InventoryId] = [];
        map[row.InventoryId].push({ groupId: row.GroupId, groupName: row.GroupName });
    });
    return map;
}

// ---- Image helper ----
// imagePath = multer se aayi filename (req.file.filename) — Images table mein ek nayi row.
async function createImage(imagePath) {
    if (!imagePath) return null;
    const pool = await getPool();
    const inserted = await pool.request()
        .input('ImagePath', sql.NVarChar(500), imagePath)
        .query('INSERT INTO Images (ImagePath) OUTPUT INSERTED.ImageId VALUES (@ImagePath)');
    return inserted.recordset[0].ImageId;
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

// ---- Reads ----

async function getAll() {
    const pool = await getPool();
    const result = await pool.request().query(`
        SELECT i.*, d.DeveloperName, s.SectorName, p.ProjectName, img.ImagePath
        FROM Inventory i
        LEFT JOIN Developers d ON d.DeveloperId = i.DeveloperId
        LEFT JOIN Sectors s ON s.SectorId = i.SectorId
        LEFT JOIN Projects p ON p.ProjectId = i.ProjectId
        LEFT JOIN Images img ON img.ImageId = i.ImageId
        ORDER BY i.DisplaySequence
    `);

    const rows = result.recordset;
    const groupsMap = await getGroupsForInventoryIds(rows.map((r) => r.InventoryId));

    return rows.map((r) => ({ ...r, Groups: groupsMap[r.InventoryId] || [] }));
}

async function getById(inventoryId) {
    const pool = await getPool();
    const result = await pool.request()
        .input('InventoryId', sql.Int, inventoryId)
        .query(`
            SELECT i.*, d.DeveloperName, s.SectorName, p.ProjectName, img.ImagePath
            FROM Inventory i
            LEFT JOIN Developers d ON d.DeveloperId = i.DeveloperId
            LEFT JOIN Sectors s ON s.SectorId = i.SectorId
            LEFT JOIN Projects p ON p.ProjectId = i.ProjectId
            LEFT JOIN Images img ON img.ImageId = i.ImageId
            WHERE i.InventoryId = @InventoryId
        `);

    const row = result.recordset[0];
    if (!row) return null;

    const groupsMap = await getGroupsForInventoryIds([row.InventoryId]);
    return { ...row, Groups: groupsMap[row.InventoryId] || [] };
}

// ---- Writes ----

async function create(data) {
    const pool = await getPool();

    const developerId = await findOrCreateDeveloper(data.developerName);
    const sectorId = await findOrCreateSector(data.sectorName);
    const projectId = await findOrCreateProject(data.projectName);
    const imageId = data.imagePath ? await createImage(data.imagePath) : null;

    const result = await pool.request()
        .input('DeveloperId', sql.Int, developerId)
        .input('SectorId', sql.Int, sectorId)
        .input('ProjectId', sql.Int, projectId)
        .input('ImageId', sql.Int, imageId)
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

    const inserted = result.recordset[0];

    if (Array.isArray(data.groupNames) && data.groupNames.length) {
        await syncInventoryGroups(inserted.InventoryId, data.groupNames);
    }

    return getById(inserted.InventoryId);
}

async function update(inventoryId, data) {
    const pool = await getPool();

    const developerId = await findOrCreateDeveloper(data.developerName);
    const sectorId = await findOrCreateSector(data.sectorName);
    const projectId = await findOrCreateProject(data.projectName);

    // Naya image aaya hai to naya Image row banao; warna jo pehle se laga hai wahi rehne do.
    let imageId;
    if (data.imagePath) {
        imageId = await createImage(data.imagePath);
    } else {
        const existing = await pool.request()
            .input('InventoryId', sql.Int, inventoryId)
            .query('SELECT ImageId FROM Inventory WHERE InventoryId = @InventoryId');
        imageId = existing.recordset[0]?.ImageId ?? null;
    }

    const result = await pool.request()
        .input('InventoryId', sql.Int, inventoryId)
        .input('DeveloperId', sql.Int, developerId)
        .input('SectorId', sql.Int, sectorId)
        .input('ProjectId', sql.Int, projectId)
        .input('ImageId', sql.Int, imageId)
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

    const updated = result.recordset[0];
    if (!updated) return null;

    if (Array.isArray(data.groupNames)) {
        await syncInventoryGroups(inventoryId, data.groupNames);
    }

    return getById(inventoryId);
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
    findOrCreateGroup,
    getMaxDisplaySequence,
    displaySequenceExists,
};