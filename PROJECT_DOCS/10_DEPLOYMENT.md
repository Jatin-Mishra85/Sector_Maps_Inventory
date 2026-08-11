# DEPLOYMENT

## Deployment targets

- Frontend: intended for Vercel / static hosting.
- Backend: intended for Render or a similar Node.js host.

## Environment variables

### Backend required env variables
- `NODE_ENV`
- `PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_SERVER`
- `DB_NAME`
- `DB_PORT`
- `DB_ENCRYPT`
- `DB_TRUST_SERVER_CERTIFICATE`
- `DB_POOL_MAX`
- `DB_POOL_MIN`
- `DB_POOL_IDLE_TIMEOUT`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `AZURE_STORAGE_CONNECTION_STRING`
- `AZURE_STORAGE_CONTAINER`
- `ADMIN_ACCESS_CODE`
- `EMAIL_USER`
- `EMAIL_APP_PASSWORD`
- `ADMIN_EMAIL_1`
- `ADMIN_EMAIL_2`
- `FRONTEND_URL`

### Frontend env variables
- `VITE_API_BASE_URL`
- `VITE_STATIC_BASE_URL`
- `VITE_APP_ENV`
- `VITE_API_TIMEOUT`

## Cross-domain cookie setup

- Backend uses `sameSite: 'none'` in production and `secure: true`.
- This is required for cross-domain auth cookies between frontend host and backend host.
- `app.js` CORS config allows `FRONTEND_URL` origin(s) and local development origins.

## Frontend base URL behavior

- In development, `ENV.API_BASE_URL` uses `/api/v1` so Vite proxy can forward requests to backend.
- In production, `ENV.API_BASE_URL` resolves to `http://<hostname>:8080/api/v1` unless overridden by `VITE_API_BASE_URL`.

## Backend CORS behavior

- Allowed origins include:
  - `http://localhost:5173`
  - `https://localhost:5173`
  - any origin listed in `FRONTEND_URL`
  - local LAN IP origins when not in production.
- Credentials are enabled in CORS.

## Notes

- Azure Blob Storage is required for image uploads in production.
- Email notification config uses Gmail SMTP credentials.
- If `AZURE_STORAGE_CONNECTION_STRING` is missing, backend startup will fail when image upload is first used.
- Render deployment must set `FRONTEND_URL` to production frontend origin.
