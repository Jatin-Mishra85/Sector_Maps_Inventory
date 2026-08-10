Summary: This document explains the app’s major features and how they work from frontend to backend.

# Key Features

## 1. Grouping System

### What it is
- Allows users to tag inventory items with one or more named groups.
- Groups are stored in `Groups` table and mapped to inventory in `InventoryGroups` junction table.

### Frontend flow
- `GroupingInventoriesPage.jsx` loads inventories and groups.
- User types group names in `GroupTypeInput`, selects inventories, and clicks save or remove.
- `groupService.addInventories` / `groupService.removeInventories` send requests to group endpoints.
- Group filters and grouping UI are driven by `useGroups` and `useInventories`.

### Backend flow
- `POST /api/v1/groups/add-inventories` is handled by `groupController.addInventoriesToGroup`.
- `groupService.addInventoriesToGroup` validates input and finds/creates the named group.
- `groupRepository.findOrCreateByName` either returns existing group or inserts a new `Groups` row.
- `groupRepository.addInventoriesToGroup` inserts rows into `InventoryGroups`, skipping duplicates.

- `POST /api/v1/groups/remove-inventories` uses `groupController.removeInventoriesFromGroup` and `groupService.removeInventoriesFromGroup`.
- The repository deletes matching `InventoryGroups` rows.

## 2. Search System

### What it is
- Search across developer, sector, project, and group names.
- Provides suggestions and fuzzy fallback.

### Frontend flow
- `SearchBar.jsx` captures text input and voice input via `useVoiceSearch`.
- `useSearch` debounces user input.
- `useInventories` performs API search when search term is present.
- `useSuggestions` fetches suggestion data from `/search/suggest` and supports fuzzy fallback.

### Backend flow
- `GET /api/v1/search/inventories` handled by `searchController.searchInventories`.
- `searchService.searchInventories` builds search params and pagination.
- `search.repository.searchInventories` splits keyword into words.
- It searches `Developers`, `Sectors`, `Projects`, and related `Groups` using normalized string matching.
- Query returns inventory rows joined with developer, sector, project, and image metadata.

- `GET /api/v1/search/suggest` handled by `searchController.suggestInventories`.
- `search.repository.suggestInventories` returns a flat list of matching names with category.
- If no exact suggestions are found, fuzzy matching is attempted using `SOUNDEX`.

## 3. Image upload and crop

### What it is
- Inventory images are uploaded from the frontend and stored in Azure Blob Storage.
- Frontend has file upload components and an image crop modal.

### Frontend flow
- Inventory create/edit forms use `FileUpload` and `ImageCropModal` components.
- `DeveloperBatchInventoryForm.jsx` appends selected image files to a `FormData` object.
- `adminService.createInventory` sends multipart form data to `/inventories`.
- `useInventories` resolves relative image URLs into full URLs for display.

### Backend flow
- `inventory.routes.js` uses `upload.single('image')` with in-memory multer storage.
- `inventory.controller.mapBody` uploads `req.file.buffer` to Azure via `azureBlob.config.uploadToAzure`.
- Azure upload returns a full URL, stored in `Images.ImagePath` and later returned as `imageUrl`.
- If the image path is already a full URL, backend passes it through unchanged.

## 4. Admin verification

### What it is
- Simple admin code verification feature for gated actions.
- Used in `AdminAccessModal` and `InventoryGrid` delete protection.

### Frontend flow
- `AdminAuthContext.jsx` stores `isAdminAuthenticated` and `isVerifying`.
- `AdminAccessModal` prompts for a code and calls `adminService.verifyCode`.
- `InventoryGrid` only allows delete action if admin auth is confirmed.

### Backend flow
- `POST /api/v1/admin/verify-code` handled by `adminController.verifyCode`.
- `adminService.verifyCode` compares the code against `process.env.ADMIN_ACCESS_CODE`.
- Returns success or error.

## 5. Save / Report inventory

### What it is
- Logged-in users can save favorites and report inventory issues.

### Frontend flow
- `InventoryActionsSave` sends `POST /interactions/save` and `DELETE /interactions/unsave/:inventoryId`.
- `InventoryActionsReport` sends `POST /interactions/report` with reason and details.
- `InventoryGrid` fetches `/interactions/saved` to highlight saved items.
- Login is handled by `LoginModal` and `GoogleLoginButton`.

### Backend flow
- `interactions.routes.js` protects save/unsave/saved endpoints with `requireAuth`.
- `report` is public and can be submitted by unauthenticated users.
- `interactions.service.saveInventory` and `unsaveInventory` validate IDs.
- `interactions.repository.saveInventory` inserts into `SavedInventories`; duplicate inserts are ignored.
- `interactions.repository.reportInventory` saves reports to `ReportedInventories`.
- `email.service.sendReportNotification` sends admin email notifications after report submission.

## 6. Inventory add/edit flow

### What it is
- Inventory items can be created or updated with developer, sector, project, card number, status, price, area, description, and optional image.

### Frontend flow
- `DeveloperBatchInventoryForm.jsx` builds form entries and uses `adminService.createInventory`.
- It fetches `next-card-number` to suggest the next available `DisplaySequence`.
- `InventoryGrid` also supports edit/delete flows and file upload via modal.

### Backend flow
- `POST /api/v1/inventories` and `PUT /api/v1/inventories/:id` handled by `inventoryController`.
- `inventory.service.validate` enforces required `displaySequence`.
- Duplicates are checked with `displaySequenceExists` and handled with 409 conflict.
- `inventory.repository.create` and `update` create/find developers, sectors, projects, groups, and images as needed.
- `syncInventoryGroups` ensures group tags are replaced cleanly on inventory update.

## Notes

- The app uses both direct `fetch()` calls and `apiClient` Axios calls in frontend code.
- Some backend controllers are lighter wrappers; most logic lives in services and repositories.
- Features marked as temporary (e.g. `EditInventoryModal`, direct delete service use in grid) suggest the UI is still evolving.
