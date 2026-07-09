/**
 * Developer Model
 * Maps raw SQL rows to a clean Developer DTO.
 */
class DeveloperModel {
  constructor(row) {
    this.developerId = row.DeveloperId;
    this.developerName = row.DeveloperName;
    this.description = row.Description;
    this.createdAt = row.CreatedAt;
    this.updatedAt = row.UpdatedAt;
    this.isDeleted = row.IsDeleted;
  }

  static fromRow(row) {
    return row ? new DeveloperModel(row) : null;
  }

  static fromRows(rows) {
    return rows.map((row) => new DeveloperModel(row));
  }
}

module.exports = DeveloperModel;