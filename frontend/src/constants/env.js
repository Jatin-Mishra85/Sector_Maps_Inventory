// Dynamic host detection — uses whatever hostname the browser is
// currently loaded on (localhost, a LAN IP like 192.168.x.x, etc).
// This means the app keeps working automatically even if your machine's
// IP address changes, or you open it from a different device on the
// same network — no more hardcoding an IP in .env that breaks later.
const dynamicHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const BACKEND_PORT = 8080;

export const ENV = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || `http://${dynamicHost}:${BACKEND_PORT}/api/v1`,
  STATIC_BASE_URL:
    import.meta.env.VITE_STATIC_BASE_URL || `http://${dynamicHost}:${BACKEND_PORT}`,
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};