Summary: This document explains the backend folder structure, request flow, and database entities used by the app.

# Backend Structure

## Major folders and purpose

- `src/app.js`
  - Configures Express middleware, CORS, cookie parsing, static file serving, routes, and global error handlers.
  - Uses `helmet`, `cors`, `cookie-parser`, `express.json()`, `express.urlencoded()`.
  - Mounts API under `/api/v1`.

- `src/server.js`
  - Connects to MSSQL via `connectDB()`.
  - Starts HTTP server and handles graceful shutdown.
  - Handles unhandled rejections and uncaught exceptions.

- `src/routes`
  - Each feature has its own route file.
  - `index.routes.js` combines them under `/api/v1`.

- `src/controllers`
  - Handle HTTP requests, call services, return JSON responses.
  - Controllers are lightweight and mostly pass data to services.

- `src/services`
  - Business logic layer.
  - Validate input, call repositories, enforce rules.
  - Examples: `inventory.service.js`, `group.service.js`, `interactions.service.js`, `auth.service.js`, `admin.service.js`, `search.service.js`.

- `src/repositories`
  - Direct SQL access layer using `mssql`.
  - Each repository maps to one or more SQL tables.
  - Repositories contain raw SQL queries and parameter binding.

- `src/database/connection.js`
  - Manages MSSQL pool connection.
  - Exposes `connectDB`, `getPool`, `closeDB`, and `sql`.

- `src/config`
  - `app.config.js`: environment flags and port.
  - `db.config.js`: MSSQL connection settings.
  - `azureBlob.config.js`: Azure Blob Storage upload helper.
  - `multer.config.js`: file upload middleware using in-memory storage.

- `src/middleware`
  - `auth.middleware.js`: attaches user from JWT cookie and requires auth for protected routes.
  - `requestLogger.middleware.js`: logs incoming requests.
  - `notFound.middleware.js`: 404 handler.
  - `error.middleware.js`: error formatter.

- `src/utils`
  - `apiResponse.util.js`: API success response helper.
  - `apiError.util.js`: error helper.
  - `asyncHandler.util.js`: wrapper for async route handlers.
  - `logger.util.js`: logging helper.

## Layered architecture

The backend follows a route → controller → service → repository → DB pattern.

1. Route file defines endpoint and middleware.
2. Controller receives request and sends JSON response.
3. Service validates and processes business logic.
4. Repository executes SQL against the database.
5. Database tables store persisted data.

Example: `POST /api/v1/inventories`
- `inventory.routes.js` → `inventory.controller.create`
- `inventory.controller.create` → `inventory.service.createInventory`
- `inventory.service.createInventory` → `inventory.repository.create`
- `inventory.repository.create` → SQL inserts into `Inventory`, `Developers`, `Sectors`, `Projects`, `Images`, and `InventoryGroups`.

## Database tables / entities

The code indicates these database entities:

- `Users`
  - Columns used: `UserId`, `GoogleId`, `Email`, `Name`, `Picture`.
  - Used for Google login and saved inventory/report tracking.

- `Developers`
  - Columns: `DeveloperId`, `DeveloperName`.
  - Inventory items link to developers.

- `Sectors`
  - Columns: `SectorId`, `SectorName`.
  - Inventory items link to sectors.

- `Projects`
  - Columns: `ProjectId`, `ProjectName`.
  - Inventory items link to projects.

- `Images`
  - Columns: `ImageId`, `ImagePath`.
  - Inventory image metadata stored here.

- `Inventory`
  - Columns: `InventoryId`, `DeveloperId`, `SectorId`, `ProjectId`, `ImageId`, `DisplaySequence`, `Price`, `AreaSqFt`, `UnitType`, `Status`, `Description`.
  - Main inventory item table.
  - `DisplaySequence` acts as Card No and must be unique.

- `Groups`
  - Columns: `GroupId`, `GroupName`, `CreatedAt`.
  - Used for grouping/tagging inventory items.

- `InventoryGroups`
  - Junction table linking inventories and groups: `InventoryId`, `GroupId`.
  - Many-to-many relation between `Inventory` and `Groups`.

- `SavedInventories`
  - Columns: `UserId`, `InventoryId`.
  - Stores favorites/saved status for authenticated users.

- `ReportedInventories`
  - Columns: `UserId`, `InventoryId`, `Reason`, `Details`.
  - Stores user reports on inventory items.

## Entity relationships

- `Inventory` has optional foreign keys: `DeveloperId`, `SectorId`, `ProjectId`, `ImageId`.
- `Inventory` is many-to-many with `Groups` via `InventoryGroups`.
- `SavedInventories` is many-to-many between `Users` and `Inventory`.
- `ReportedInventories` tracks reports from `Users` against `Inventory`.

## Notes on service behavior

- `auth.service.js` verifies Google ID token and creates a `Users` row if needed.
- `admin.service.js` validates `ADMIN_ACCESS_CODE` from environment.
- `interactions.service.js` validates inventory IDs, report reasons, and detail length.
- `search.repository.js` searches across developers, sectors, projects, and group names.
- `inventory.repository.js` creates authors/sectors/projects/groups on demand when saving inventory.
- `group.repository.js` prevents duplicate `InventoryGroups` entries with an `IF NOT EXISTS` insert.
- `image.service.js` and `image.controller.js` manage image metadata, but active image uploads use `inventory.controller.js` + Azure Blob.

## Notes on backend security and suspicious behavior

- Auth middleware attaches `req.user` from JWT cookie and protects save/unsave/saved endpoints.
- `reportInventory` can be called without authentication, but still records `UserId` if available.
- Some controllers use try/catch and return status 500 for unexpected errors.
- `group.repository.js` has console debug logs for creation paths.

## Config details

- `db.config.js` uses MSSQL environment variables and offers TLS/trust config.
- `azureBlob.config.js` requires `AZURE_STORAGE_CONNECTION_STRING` and writes to a container.
- `multer.config.js` only allows JPEG/PNG and caps uploads at 15 MB.
- `app.config.js` exposes `isProduction`, `isDevelopment`, `port`, and `appName`.
