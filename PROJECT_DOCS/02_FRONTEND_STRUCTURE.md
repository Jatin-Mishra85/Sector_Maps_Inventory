Summary: This document describes the frontend folder structure, feature modules, state management, and routing.

# Frontend Structure

## Major folders and purpose

- `src/app`
  - `App.jsx`: top-level app component. Wraps providers and routes.
  - `AppProviders.jsx`: wraps app with `HashRouter`, `ToastProvider`, `AdminAuthProvider`, and `ErrorBoundary`.

- `src/routes`
  - `AppRoutes.jsx`: defines app route structure with React Router.

- `src/pages`
  - `HomePage.jsx`: main inventory browsing page.
  - `AdminInventoryFormPage.jsx`: UI for adding inventory via batch form.
  - `GroupingInventoriesPage.jsx`: inventory grouping management page.
  - `ProfilePage.jsx`: user profile and logout.
  - `NotFoundPage.jsx`: fallback page.

- `src/components`
  - Shared UI components such as `LoginModal`, `PromoBanner`, `InventoryActions`, common buttons, inputs, file upload, toast, loader, error boundary, etc.

- `src/features`
  - `admin`: admin-related pages and components for adding inventory, admin access code verification.
  - `developer`: grouping-related pages, components, hooks, and services.
  - `inventory`: inventory display, grid, card, edit modal, upload modal, hooks, and service.
  - `search`: search bar, voice search hook, suggestions, and search hook.

- `src/context`
  - `AuthContext.jsx`: manages current user, login/logout, and `auth/me` fetch.
  - `AdminAuthContext.jsx`: admin access verification state.
  - `ToastContext.jsx`: global toast notifications.

- `src/services`
  - `apiClient.js`: Axios client with base URL and interceptors.
  - `errorHandler.js`: API error parser.

- `src/constants`
  - `env.js`: environment-aware API and static URLs.
  - `apiEndpoints.js`: backend endpoint definitions.
  - `appConstants.js`: app constants.

- `src/hooks`
  - `useDebounce.js`: debounces value updates.
  - `useSiteGate.js`: site unlock state.

- `src/utils`
  - `classNames.js`, `cropImage.js`, `download.js`, `share.js`: utility functions.

- `src/styles`
  - `variables.css`, `global.css`: global styling.

## Feature modules

### Inventory
- `src/features/inventory/components`: inventory card, grid, edit modal, photo upload modal, image preview, etc.
- `src/features/inventory/hooks/useInventories.js`: fetches inventory list, supports pagination, search and developer filters, error state, local patching.
- `src/features/inventory/services/inventoryService.js`: wrapper around API endpoints for inventories.
- Provides inventory browsing, saving, deleting, editing, and photo upload flows.

### Grouping / Developer
- `src/features/developer/pages/GroupingInventoriesPage.jsx`: UI for selecting inventories and adding/removing group tags.
- `src/features/developer/components`: manage groups modal, group filter chips, group type input.
- `src/features/developer/hooks/useGroups.js`: loads groups from backend.
- `src/features/developer/services/groupService.js`: calls group endpoints.
- Handles group creation, group deletion, add/remove inventories to groups.

### Search
- `src/features/search/components/SearchBar/SearchBar.jsx`: input component with voice search support and suggestions.
- `src/features/search/hooks/useSearch.js`: search term state + debounce.
- `src/features/search/hooks/useSuggestions.js`: autocomplete suggestions and fuzzy fallback.
- Search is used by `HomePage` and grouping page.

### Admin
- `src/features/admin/pages/AdminInventoryFormPage.jsx`: page to add new inventory items.
- `src/features/admin/components/DeveloperBatchInventoryForm`: bulk add inventory using developer, sector, project rows, card IDs, and images.
- `src/features/admin/services/adminService.js`: verify admin code, create inventory, fetch next card number.
- Admin code is used for protected delete actions and access modal.

## State management

- Context API is used for global state:
  - `AuthContext` for user authentication state.
  - `ToastContext` for toast messages.
  - `AdminAuthContext` for admin code verification state.

- Local component state is used extensively with `useState` for UI state such as dialogs, selected inventory, form fields, menu open state, and loading.
- Data fetching and logic are isolated in custom hooks:
  - `useInventories` for inventory list fetching and pagination.
  - `useGroups` for group list fetching.
  - `useSearch` for search term debounce.
  - `useSuggestions` for suggestion fetch and fuzzy logic.

- `react-hook-form` is used in the admin batch inventory form for complex form handling.

## Routing structure

Defined in `src/routes/AppRoutes.jsx` inside `MainLayout`.

Routes:
- `/` → `HomePage`
- `/admin` → `AdminInventoryFormPage`
- `/grouping` → `GroupingInventoriesPage`
- `/profile` → `ProfilePage`
- `*` → `NotFoundPage`

`MainLayout.jsx` includes site navigation, login button/modal, and page wrapper.

## Notes on routing / state

- Frontend uses `HashRouter` in `AppProviders.jsx`.
- API base URL is dynamic and uses proxy in development.
- Login uses `GoogleLoginButton` inside `LoginModal`, but auth state is stored in a cookie and fetched from `/auth/me`.
- Some components such as `InventoryGrid` still use direct fetch in places instead of centralized service calls.
