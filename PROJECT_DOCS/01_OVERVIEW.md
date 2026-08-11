# PROJECT OVERVIEW

## Project kya karta hai
Sector_Maps_Inventory ek real estate inventory management system hai jo:

- Developers, sectors, projects, aur inventory items ko manage karta hai.
- Inventory items ko card number, price, area, status, description, aur image ke saath store karta hai.
- Users ko inventory search, save/bookmark, report, aur group/tag karne ka support deta hai.
- Admin users ko inventory add/update/delete, developer/sector/project/group management, aur inventory grouping controls deta hai.
- Frontend React/Vite app ko backend Node/Express/MSSQL API ke saath connect karta hai.

## Tech stack

- Backend:
  - Node.js
  - Express
  - MSSQL (`mssql` package)
  - Google OAuth (`google-auth-library`)
  - JSON Web Tokens (`jsonwebtoken`)
  - Cookie auth via `cookie-parser`
  - File upload via `multer` (in-memory)
  - Azure Blob Storage via `@azure/storage-blob`
  - Security middleware: `helmet`, `cors`

- Frontend:
  - React 19
  - Vite 8
  - React Router DOM 7
  - `react-hook-form`
  - `@react-oauth/google`
  - Axios
  - React icons, crop and upload UI components

- Database / infra:
  - Microsoft SQL Server
  - Azure Blob Storage for image files
  - Email notifications via Gmail SMTP with `nodemailer`

## Folder structure

### Root structure
- `backend/`
- `frontend/`
- `PROJECT_DOCS/`

### Backend top levels
- `backend/src/server.js` — app start and DB connect
- `backend/src/app.js` — express app, middleware, CORS, routes
- `backend/src/routes/` — route files mounted under `/api/v1`
- `backend/src/controllers/` — request handlers
- `backend/src/services/` — business logic and validation
- `backend/src/repositories/` — direct DB SQL queries
- `backend/src/config/` — app, DB, multer, Azure settings
- `backend/src/middleware/` — auth, logging, errors
- `backend/src/database/connection.js` — MSSQL connection pool

### Frontend top levels
- `frontend/src/main.jsx` — React root bootstrap
- `frontend/src/app/AppProviders.jsx` — global providers, router
- `frontend/src/routes/AppRoutes.jsx` — app route definitions
- `frontend/src/pages/` — screen pages
- `frontend/src/features/` — feature modules
- `frontend/src/components/` — reusable UI components
- `frontend/src/context/` — auth and toast contexts
- `frontend/src/services/` — API client and error handling
- `frontend/src/constants/` — API endpoints and env constants
- `frontend/src/hooks/` — custom hooks

## Important project flow

- Frontend app uses `HashRouter` and `AuthProvider`.
- `AuthContext` fetches `/auth/me` and maintains login state.
- Backend uses cookie-based JWT auth stored in `auth_token`.
- Admin state is derived from `Users.IsAdmin` and exposed through `AdminAuthContext`.
- Inventory creation/update uses multipart image upload and Azure Blob Storage.
- Search works by keyword across developers, sectors, projects, and group names.

## Related docs
- `PROJECT_DOCS/08_DATABASE_SCHEMA.md`
- `PROJECT_DOCS/09_AUTHORIZATION.md`
- `PROJECT_DOCS/10_DEPLOYMENT.md`
- `PROJECT_DOCS/04_API_ENDPOINTS.md`
- `PROJECT_DOCS/02_FRONTEND_STRUCTURE.md`
- `PROJECT_DOCS/03_BACKEND_STRUCTURE.md`
