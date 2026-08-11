# DATABASE SCHEMA

## Tables and columns

### Users
- `UserId` (int, PK)
- `GoogleId` (nvarchar(255), nullable)
- `Email` (nvarchar(255), nullable)
- `Name` (nvarchar(255), nullable)
- `Picture` (nvarchar(500), nullable)
- `PasswordHash` (nvarchar(255), nullable)
- `IsAdmin` (bit, nullable)

### Developers
- `DeveloperId` (int, PK)
- `DeveloperName` (nvarchar(255), not null)

### Sectors
- `SectorId` (int, PK)
- `SectorName` (nvarchar(255), not null)

### Projects
- `ProjectId` (int, PK)
- `ProjectName` (nvarchar(255), not null)

### Images
- `ImageId` (int, PK)
- `ImagePath` (nvarchar(500), not null)

### Inventory
- `InventoryId` (int, PK)
- `DeveloperId` (int, FK, nullable)
- `SectorId` (int, FK, nullable)
- `ProjectId` (int, FK, nullable)
- `ImageId` (int, FK, nullable)
- `DisplaySequence` (decimal(10,2), not null)
- `Price` (decimal(18,2), nullable)
- `AreaSqFt` (decimal(10,2), nullable)
- `UnitType` (nvarchar(255), nullable)
- `Status` (nvarchar(255), nullable)
- `Description` (nvarchar(max), nullable)
- `GoogleMapUrl` (nvarchar(500), nullable)

### Groups
- `GroupId` (int, PK)
- `GroupName` (nvarchar(255), not null)
- `CreatedAt` (datetime, nullable)

### InventoryGroups
- `InventoryId` (int, FK)
- `GroupId` (int, FK)

### SavedInventories
- `UserId` (int, FK)
- `InventoryId` (int, FK)

### ReportedInventories
- `UserId` (int, FK, nullable)
- `InventoryId` (int, FK)
- `Reason` (nvarchar(50), not null)
- `Details` (nvarchar(500), not null)

## Relationships

- `Inventory.DeveloperId` → `Developers.DeveloperId`
- `Inventory.SectorId` → `Sectors.SectorId`
- `Inventory.ProjectId` → `Projects.ProjectId`
- `Inventory.ImageId` → `Images.ImageId`
- `InventoryGroups.InventoryId` → `Inventory.InventoryId`
- `InventoryGroups.GroupId` → `Groups.GroupId`
- `SavedInventories.UserId` → `Users.UserId`
- `SavedInventories.InventoryId` → `Inventory.InventoryId`
- `ReportedInventories.UserId` → `Users.UserId`
- `ReportedInventories.InventoryId` → `Inventory.InventoryId`

## Business entity mapping

- `Users` represents app users who can login with Google or email/password.
- `Developers` represents property developers or builder companies.
- `Sectors` represents geographic sectors or zones.
- `Projects` represents individual real estate projects.
- `Images` stores image metadata and blob URLs.
- `Inventory` represents property listings and cards.
- `Groups` represents custom group/tag categories.
- `InventoryGroups` links inventory items to group tags.
- `SavedInventories` tracks bookmarked inventory by user.
- `ReportedInventories` tracks user reports against inventory.

## Notes

- `DisplaySequence` is treated as a unique card number and is validated for conflicts.
- Group names are created on demand when inventory or group operations refer to them.
- `GoogleMapUrl` was added by a migration and is optional.
