Summary: This document notes cleanup actions and suspicious code issues found during the scan.

# Known Issues and Cleanup

## Cleanup / suspicious findings

- `backend/src/services/interactions.service.js` contains nested duplicate `reportInventory` function blocks. This is a clear code bug and may break the module export.
- `frontend/src/features/inventory/components/InventoryGrid/InventoryGrid.jsx` uses direct `fetch('/api/v1/interactions/saved', ...)` instead of the central `apiClient` service.
- `frontend/src/features/inventory/components/InventoryGrid/InventoryGrid.jsx` also imports `inventoryService` for delete actions, but delete is a temporary UI path rather than a fully abstracted feature.
- `frontend/src/features/inventory/hooks/useInventories.js` has detailed item mapping comments and resolves relative URLs, but the service call shape handling is inconsistent between `response.data` and plain array payload. This is a maintenance concern.
- `frontend/src/features/search/components/SearchBar/SearchBar.jsx` hides the dropdown with `const showDropdown = false`, meaning suggestion UI is disabled even though suggestion logic is active.
- `backend/src/repositories/group.repository.js` has console.debug-style logs in `findOrCreateByName`, which are suspicious for production code.

## Potential inconsistencies / risks

- `auth.controller.js` catches Google login errors and returns hardcoded `401` with generic message while the service may produce more specific errors.
- `auth.service.js` requires `GOOGLE_CLIENT_ID` and `JWT_SECRET`; if missing, auth flow will fail entirely.
- `azureBlob.config.js` throws if `AZURE_STORAGE_CONNECTION_STRING` is missing, making image upload highly environment-dependent.
- `admin.service.js` requires `ADMIN_ACCESS_CODE`; if not configured, it returns 500 and blocks the admin verification path.
- `backend/src/database/connection.js` relies on the pool event error handler to reset pool. If not carefully tested, transient DB errors may still cause request failures.
- `search.repository.js` contains an `inventoryType` filter assumption on `i.UnitType`, but frontend does not appear to pass this filter consistently.
- `frontend/src/features/admin/components/DeveloperBatchInventoryForm/DeveloperBatchInventoryForm.jsx` is a complex form that can create entries with blank project names or card IDs if not validated properly.
- `frontend/src/context/AdminAuthContext.jsx` is used for admin gate state, but the page comments indicate admin code gates were intentionally removed in some places. This may cause inconsistent UI access control.

## Missing or unclear behavior

- No frontend route or page for developer or project management beyond grouping and inventory addition.
- The backend has `image` endpoints, but frontend appears to use only inventory image upload and not standalone image management.
- `frontend/src/pages/HomePage.jsx` sets `savedOnly` state but no dedicated saved items API in services; saved-only filtering is implemented client-side by `InventoryGrid`.
- Purpose of `backend/src/repositories/Inventorygroup.repository.js` and `backend/src/routes/Inventorygroup.routes.js` is only partially exposed in frontend code. There is no clear frontend usage of those direct inventory-group endpoints.
- `frontend/src/components/PromoBanner/PromoBanner.jsx` and certain CSS files are not referenced in the feature docs, but likely serve UI branding. Exact purpose unclear from route scan.

## Recommended cleanup actions

- Fix `interactions.service.js` duplicate function definitions.
- Standardize API calls through `apiClient` or central fetch helpers rather than mixing `fetch()` and Axios.
- Remove debug `console.log` statements in backend repository code.
- Re-enable or remove the hidden suggestions dropdown in `SearchBar`.
- Consolidate `InventoryGrid` temporary and permanent flows to avoid duplicate delete/update code.
- Add explicit validation in `DeveloperBatchInventoryForm` for required card number fields.
- Clarify usage of `InventoryGroup` direct endpoints or remove the unused service layer if not used.
