class InventoryModel {
  constructor(row) {
    this.inventoryId = row.InventoryId;
    this.developerId = row.DeveloperId;
    this.sectorId = row.SectorId;
    this.inventoryType = row.InventoryType;
    this.inventoryName = row.InventoryName;
    this.description = row.Description;
    this.imageUrl = row.ImageUrl;
    this.googleMapUrl = row.GoogleMapUrl;
    this.googleMapPolygon = row.GoogleMapPolygon;
    this.createdAt = row.CreatedAt;
    this.updatedAt = row.UpdatedAt;
    this.isDeleted = row.IsDeleted;

    if (row.DeveloperName !== undefined) {
      this.developerName = row.DeveloperName;
    }
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