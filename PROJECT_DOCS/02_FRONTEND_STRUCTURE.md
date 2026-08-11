# FRONTEND ARCHITECTURE

## Major folders and purpose

- `src/app`
  - `AppProviders.jsx` wraps the app with `HashRouter`, `ToastProvider`, `AuthProvider`, and `AdminAuthProvider`.

- `src/routes`
  - `AppRoutes.jsx` defines the route tree used by `MainLayout`.

- `src/pages`
  - `HomePage.jsx`: main inventory browsing page.
  - `AdminInventoryFormPage.jsx`: inventory add page.
  - `GroupingInventoriesPage.jsx`: inventory grouping management page.
  - `ProfilePage.jsx`: user profile/logout page.
  - `NotFoundPage.jsx`: catch-all fallback page.

- `src/components`
  - Shared components such as `LoginModal`, `InventoryActions`, `Button`, `Toast`, `EmptyState`, and `RetryState`.

- `src/features`
  - `admin`: admin-focused inventory creation and form components.
  - `developer`: grouping and group management features.
  - `inventory`: inventory display, edit, upload, and grid components.
  - `search`: search input, suggestions, and voice search.

- `src/context`
  - `AuthContext.jsx`: manages login, signup, logout, and current user state.
  - `AdminAuthContext.jsx`: computes admin access based on `user?.isAdmin`.
  - `ToastContext.jsx`: global toast notification state.

- `src/services`
  - `apiClient.js`: Axios client and common request setup.
  - `errorHandler.js`: API error parsing.

- `src/constants`
  - `env.js`: dynamic API/static host URL resolution.
  - `apiEndpoints.js`: endpoint paths used by services.
  - `appConstants.js`: app constants like `ALL_TYPES_ID`.

- `src/hooks`
  - `useSearch.js`: debounced search input state.
  - `useSiteGate.js`: temporary site unlock gate.

- `src/utils`
  - `download.js`, `share.js`, `cropImage.js`, `classNames.js`: utility helpers.

## Feature modules

### Inventory
- `InventoryGrid` renders inventory cards, handles infinite scroll, preview, saved-only view, and admin management actions.
- `InventoryCard` displays item details, save/report controls, and optional admin edit/delete behavior.
- `useInventories` fetches inventory lists, handles search vs list mode, pagination, and error states.
- `inventoryService` wraps inventory API calls.

### Grouping / Developer
- `GroupingInventoriesPage` provides inventory selection, group add/remove UI, and group filters.
- `useGroups` loads group metadata and inventory counts.
- `groupService` calls backend group endpoints.
- Group state is used to filter inventories and manage inventory tags.

### Search
- `SearchBar` is the search input component with voice search support.
- `useSearch` debounces term updates before API calls.
- `useSuggestions` fetches autocomplete suggestions from the backend.
- Search results update inventory list using `useInventories`.

### Admin
- `AdminInventoryFormPage` hosts admin inventory creation flows.
- `DeveloperBatchInventoryForm` handles bulk inventory entry and file upload.
- `adminService` fetches next card number and submits inventory create requests.

## Context providers

- `AuthProvider` loads current user from `/auth/me` and exposes `loginWithGoogle`, `login`, `signup`, and `logout`.
- `AdminAuthProvider` uses `user?.isAdmin` to determine `isAdminAuthenticated`.
- `ToastProvider` displays notifications across the app.

## Admin-only gating

- `MainLayout` only shows admin navigation links when `isAdminAuthenticated` is true.
- `InventoryGrid` only enables admin controls when `canManage` is true.
- Admin gating in UI is based on DB-driven `Users.IsAdmin`, not a separate frontend secret.

## Routing structure

Defined in `src/routes/AppRoutes.jsx` under `MainLayout`.

Routes:
- `/` → `HomePage`
- `/admin` → `AdminInventoryFormPage`
- `/grouping` → `GroupingInventoriesPage`
- `/profile` → `ProfilePage`
- `*` → `NotFoundPage`

## Notes on state and API

- Frontend uses `HashRouter`.
- `ENV.API_BASE_URL` is dynamic: uses proxy in development and full backend URL in production.
- `AuthContext` stores login state via secure cookies and refreshes user data from `/auth/me`.
- Some frontend code mixes direct `fetch()` calls with centralized `apiClient` usage.
- Temporary admin UI patterns exist, including inline edit flows and direct inventory delete actions.
