Summary: This document lists all backend API endpoints, their purpose, and the controller/service handling them.

# API Endpoints

Method | Endpoint | Purpose | Controller / Service
---|---|---|---
POST | `/api/v1/auth/google` | Google login with `idToken`, sets `auth_token` cookie | `authController.googleLogin` → `authService.loginWithGoogle`
GET | `/api/v1/auth/me` | Returns current authenticated user data, or null | `authController.getMe`
POST | `/api/v1/auth/logout` | Clears auth cookie and logs out | `authController.logout`

GET | `/api/v1/developers` | Get all developers | `developerController.getAll` → `developerService.getAllDevelopers`
GET | `/api/v1/developers/:id` | Get developer by ID | `developerController.getById` → `developerService.getDeveloperById`
POST | `/api/v1/developers` | Create a developer | `developerController.create` → `developerService.createDeveloper`
PUT | `/api/v1/developers/:id` | Update a developer | `developerController.update` → `developerService.updateDeveloper`
DELETE | `/api/v1/developers/:id` | Delete a developer | `developerController.remove` → `developerService.deleteDeveloper`

GET | `/api/v1/sectors` | Get sectors, optionally paginated and filtered by developer | `sectorController.getAllSectors` → `sectorService.getAllSectors`
GET | `/api/v1/sectors/:id` | Get sector by ID | `sectorController.getSectorById` → `sectorService.getSectorById`
POST | `/api/v1/sectors` | Create a sector | `sectorController.createSector` → `sectorService.createSector`
PUT | `/api/v1/sectors/:id` | Update a sector | `sectorController.updateSector` → `sectorService.updateSector`
DELETE | `/api/v1/sectors/:id` | Delete a sector | `sectorController.deleteSector` → `sectorService.deleteSector`

GET | `/api/v1/projects` | Get all projects | `projectController.getAll` → `projectService.getAllProjects`
GET | `/api/v1/projects/:id` | Get project by ID | `projectController.getById` → `projectService.getProjectById`
POST | `/api/v1/projects` | Create a project | `projectController.create` → `projectService.createProject`
PUT | `/api/v1/projects/:id` | Update a project | `projectController.update` → `projectService.updateProject`
DELETE | `/api/v1/projects/:id` | Delete a project | `projectController.remove` → `projectService.deleteProject`

GET | `/api/v1/groups` | Get all groups with inventory counts | `groupController.getAll` → `groupService.getAllGroups`
GET | `/api/v1/groups/:id` | Get group by ID | `groupController.getById` → `groupService.getGroupById`
POST | `/api/v1/groups` | Create a group | `groupController.create` → `groupService.createGroup`
PUT | `/api/v1/groups/:id` | Update a group | `groupController.update` → `groupService.updateGroup`
DELETE | `/api/v1/groups/:id` | Delete a group and its mappings | `groupController.remove` → `groupService.deleteGroup`
POST | `/api/v1/groups/add-inventories` | Add inventories to an existing or new group | `groupController.addInventoriesToGroup` → `groupService.addInventoriesToGroup`
POST | `/api/v1/groups/remove-inventories` | Remove inventories from a group | `groupController.removeInventoriesFromGroup` → `groupService.removeInventoriesFromGroup`

GET | `/api/v1/inventories` | Get paginated inventory list | `inventoryController.getAll` → `inventoryService.getAllInventory`
GET | `/api/v1/inventories/next-card-number` | Get next available card number | `inventoryController.getNextCardNumber` → `inventoryService.getNextCardNumber`
GET | `/api/v1/inventories/:id` | Get inventory by ID | `inventoryController.getById` → `inventoryService.getInventoryById`
POST | `/api/v1/inventories` | Create inventory item, optional image upload | `inventoryController.create` → `inventoryService.createInventory`
PUT | `/api/v1/inventories/:id` | Update inventory item, optional image upload | `inventoryController.update` → `inventoryService.updateInventory`
DELETE | `/api/v1/inventories/:id` | Delete inventory item | `inventoryController.remove` → `inventoryService.deleteInventory`

GET | `/api/v1/images` | Get all image metadata | `imageController.getAll` → `imageService.getAllImages`
GET | `/api/v1/images/:id` | Get image metadata by ID | `imageController.getById` → `imageService.getImageById`
POST | `/api/v1/images` | Create image metadata row | `imageController.create` → `imageService.createImage`
PUT | `/api/v1/images/:id` | Update image metadata | `imageController.update` → `imageService.updateImage`
DELETE | `/api/v1/images/:id` | Delete image metadata | `imageController.remove` → `imageService.deleteImage`

GET | `/api/v1/search/inventories` | Search inventories by keyword, type, pagination | `searchController.searchInventories` → `searchService.searchInventories`
GET | `/api/v1/search/suggest` | Suggest matching developers/sectors/projects/groups | `searchController.suggestInventories` → `searchService.suggestInventories`

POST | `/api/v1/admin/verify-code` | Verify admin access code | `adminController.verifyCode` → `adminService.verifyCode`

POST | `/api/v1/interactions/save` | Save inventory for logged-in user | `interactionsController.saveInventory` → `interactionsService.saveInventory`
DELETE | `/api/v1/interactions/unsave/:inventoryId` | Unsave inventory for logged-in user | `interactionsController.unsaveInventory` → `interactionsService.unsaveInventory`
GET | `/api/v1/interactions/saved` | Get saved inventory IDs for user | `interactionsController.getSavedIds` → `interactionsService.getSavedInventoryIds`
POST | `/api/v1/interactions/report` | Report an inventory item | `interactionsController.reportInventory` → `interactionsService.reportInventory`

## Notes

- Routes under `/api/v1/interactions` use `requireAuth` for save/unsave/saved, but report is open to unauthenticated users.
- Inventory create/update routes accept multipart form data and use Azure upload middleware in `inventory.routes.js`.
