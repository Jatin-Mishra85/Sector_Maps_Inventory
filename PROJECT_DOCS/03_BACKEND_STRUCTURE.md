# BACKEND STRUCTURE

## Main backend folders

- `backend/src/server.js`
  - Connects to SQL Server with `connectDB()`.
  - Starts the Express server on `process.env.PORT || 5000`.

- `backend/src/app.js`
  - Configures global middleware.
  - Uses `helmet`, `cors`, `cookie-parser`, `express.json()`, `express.urlencoded()`.
  - Serves static uploads at `/uploads`.
  - Mounts API routes under `/api/v1`.
  - Includes health check `/health`.

- `backend/src/routes/`
  - Mounts each feature set under `/api/v1`.
  - Contains: `auth.routes.js`, `developer.routes.js`, `sector.routes.js`, `project.routes.js`, `group.routes.js`, `inventory.routes.js`, `image.routes.js`, `Inventorygroup.routes.js`, `search.routes.js`, `interactions.routes.js`.

- `backend/src/controllers/`
  - Controllers handle HTTP request/response.
  - They call services and return JSON.

- `backend/src/services/`
  - Services contain business logic, validation, and coordination.
  - They call repositories and handle domain rules.

- `backend/src/repositories/`
  - Repositories execute raw SQL queries.
  - They map repository methods to table operations.

- `backend/src/database/connection.js`
  - Manages MSSQL connection pool.
  - Exposes `connectDB()`, `getPool()`, `closeDB()`, and `sql`.

- `backend/src/config/`
  - `app.config.js` — environment flags.
  - `db.config.js` — SQL Server connection config.
  - `azureBlob.config.js` — Azure upload helper.
  - `multer.config.js` — in-memory file upload config.

- `backend/src/middleware/`
  - `auth.middleware.js` — attaches `req.user`, `requireAuth`, `requireAdmin`.
  - `requestLogger.middleware.js` — request logging.
  - `notFound.middleware.js` — 404 handler.
  - `error.middleware.js` — error formatter.

- `backend/src/utils/`
  - Helpers for API responses, async wrapping, logging, and errors.

## Route and auth flow

- `backend/src/app.js` uses `attachUser` before all routes.
- `attachUser` reads `auth_token` cookie, verifies JWT with `JWT_SECRET`, and loads user from `Users`.
- Protected backend actions use:
  - `requireAuth` — any logged-in user.
  - `requireAdmin` — only users with `Users.IsAdmin = 1`.

## Admin-protected backend route groups

- `developer.routes.js`: POST/PUT/DELETE require `requireAdmin`.
- `sector.routes.js`: POST/PUT/DELETE require `requireAdmin`.
- `project.routes.js`: POST/PUT/DELETE require `requireAdmin`.
- `group.routes.js`: POST/PUT/DELETE and add/remove inventory actions require `requireAdmin`.
- `inventory.routes.js`: POST/PUT/DELETE require `requireAdmin`.
- `image.routes.js`: POST/PUT/DELETE require `requireAdmin`.
- `Inventorygroup.routes.js`: POST/DELETE require `requireAdmin`.

## Public / auth-based route groups

- `auth.routes.js`: login/signup/logout and `me` endpoint.
- `search.routes.js`: public inventory search and suggest.
- `interactions.routes.js`
  - save/unsave/saved require `requireAuth`.
  - report is public.

## Database schema summary

See `PROJECT_DOCS/08_DATABASE_SCHEMA.md` for table names, columns, types, and relationships.

## Notes and warnings

- The backend assumes a production cross-domain setup with `sameSite: none` and `secure: true` for cookies.
- `azureBlob.config.js` throws if `AZURE_STORAGE_CONNECTION_STRING` is missing.
- `auth.service.js` depends on `GOOGLE_CLIENT_ID` and `JWT_SECRET`.
- `app.js` accepts origins from `FRONTEND_URL` and local LAN origins.
- There are some temporary or debugging artifacts in the code, such as direct fetch usage in frontend and debug logs in group repository.
