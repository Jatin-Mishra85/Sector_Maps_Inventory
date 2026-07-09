/**
 * Sector Model
 * Maps raw SQL rows to a clean Sector DTO.
 */
class SectorModel {
  constructor(row) {
    this.sectorId = row.SectorId;
    this.developerId = row.DeveloperId;
    this.sectorName = row.SectorName;
    this.description = row.Description;
    this.createdAt = row.CreatedAt;
    this.updatedAt = row.UpdatedAt;
    this.isDeleted = row.IsDeleted;

    // Present only when joined with Developer
    if (row.DeveloperName !== undefined) {
      this.developerName = row.DeveloperName;
    }
  }

  static fromRow(row) {
    return row ? new SectorModel(row) : null;
  }

  static fromRows(rows) {
    return rows.map((row) => new SectorModel(row));
  }
}

module.exports = SectorModel;