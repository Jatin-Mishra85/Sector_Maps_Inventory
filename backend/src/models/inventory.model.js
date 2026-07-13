class InventoryModel {
  constructor(row) {
    this.inventoryId = row.InventoryId;
    this.sectorId = row.SectorId;
    this.inventoryName = row.InventoryName; // "Project" in the UI
    this.block = row.Block;
    this.inventoryDeveloperName = row.InventoryDeveloperName; // "Developer" in the UI
    this.description = row.Description;
    this.imageUrl = row.ImageUrl;
    this.googleMapUrl = row.GoogleMapUrl;
    this.googleMapPolygon = row.GoogleMapPolygon;
    this.createdAt = row.CreatedAt;
    this.updatedAt = row.UpdatedAt;
    this.isDeleted = row.IsDeleted;

    // "Grouping" in the UI — many-to-many via InventoryGroups.
    // Array of { groupId, groupName }.
    this.groups = Array.isArray(row.Groups) ? row.Groups : [];

    if (row.SectorName !== undefined) {
      this.sectorName = row.SectorName;
    }
  }

  static fromRow(row) {
    return row ? new InventoryModel(row) : null;
  }

  static fromRows(rows) {
    return rows.map((row) => new InventoryModel(row));
  }
}

module.exports = InventoryModel;