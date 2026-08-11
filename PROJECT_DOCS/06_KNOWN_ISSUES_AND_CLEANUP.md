# KNOWN ISSUES / PENDING WORK

## Confirmed issues

- `backend/src/services/interactions.service.js` has nested duplicate `reportInventory` definitions. This is a real bug and can break report handling.
- `frontend/src/features/inventory/components/InventoryGrid/InventoryGrid.jsx` bypasses centralized API service for saved inventory lookups by using a direct `fetch()` call.
- `frontend/src/features/inventory/components/InventoryGrid/InventoryGrid.jsx` still uses temporary delete behavior through `inventoryService.remove`, which is not fully abstracted.
- `frontend/src/features/search/components/SearchBar/SearchBar.jsx` has suggestion UI logic disabled (`showDropdown = false`) despite backend suggestion support.
- `backend/src/repositories/group.repository.js` contains console debug statements in `findOrCreateByName`, which should be removed for production.

## Risky/incomplete flows

- Auth state is mixed:
  - `AuthContext` handles login and current user.
  - `AdminAuthContext` gates UI from `user.isAdmin`.
  - Some admin pages note that admin-code gate is intentionally removed, but backend write routes remain protected.
- Backend image API exists, but frontend appears to upload images only through inventory create/update paths.
- `frontend/src/features/admin/components/DeveloperBatchInventoryForm/DeveloperBatchInventoryForm.jsx` may accept invalid or incomplete user input without stronger validation.
- `search.repository.js` includes an `inventoryType` filter branch that frontend does not currently supply.
- `backend/src/database/connection.js` resets the pool on error, but transient MSSQL failures could still affect requests if not tested thoroughly.

## Known technical debt and temporary UI

- `InventoryCard` and `InventoryGrid` contain temporary admin-edit flows and local override state.
- `useInventories.js` handles both raw array and wrapped API response shapes, which is fragile.
- `SearchBar` suggestion dropdown is implemented but hidden by the UI state.
- `useSiteGate.js` is a temporary seed gate that should be removed once a real admin panel exists.
- `developer.routes.js`, `sector.routes.js`, `project.routes.js`, `group.routes.js`, `image.routes.js`, and `Inventorygroup.routes.js` are all write-protected but may not be fully used by the current frontend.

## Suggested cleanup

- Fix duplicate function bug in `interactions.service.js`.
- Standardize API requests through `apiClient` or shared fetch wrappers.
- Remove debug logs and temporary comments from backend repository code.
- Decide whether search suggestions should be visible; if yes, enable dropdown logic.
- Consolidate temporary admin UI flows into a consistent admin panel.
- Validate card number, project, and group fields more strictly in admin forms.
- Document or remove unused inventory-group direct endpoints.
