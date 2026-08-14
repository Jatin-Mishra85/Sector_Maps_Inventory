// Single source of truth for API/backend configuration.
// DEV: relative /api/v1 -> handled by Vite proxy -> http://localhost:8080
// PROD: absolute Render backend URL. Never derived from window.location or :8080.

const isDev = import.meta.env.DEV;

// Only used by the Vite proxy target (server-side, dev-only). Never used to build prod URLs.
export const BACKEND_PORT = 8080;

const DEV_FALLBACK_API_BASE_URL = '/api/v1';
const DEV_FALLBACK_STATIC_BASE_URL = '';

const PROD_FALLBACK_API_BASE_URL = 'https://sector-maps-backend.onrender.com/api/v1';
const PROD_FALLBACK_STATIC_BASE_URL = 'https://sector-maps-backend.onrender.com';

export const ENV = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    (isDev ? DEV_FALLBACK_API_BASE_URL : PROD_FALLBACK_API_BASE_URL),

  STATIC_BASE_URL:
    import.meta.env.VITE_STATIC_BASE_URL ||
    (isDev ? DEV_FALLBACK_STATIC_BASE_URL : PROD_FALLBACK_STATIC_BASE_URL),

  APP_ENV: import.meta.env.VITE_APP_ENV || (isDev ? 'development' : 'production'),

  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,

  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};