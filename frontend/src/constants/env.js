// Dynamic host detection — uses whatever hostname the browser is
// currently loaded on (localhost, a LAN IP like 192.168.x.x, etc).
// This means the app keeps working automatically even if your machine's
// IP address changes, or you open it from a different device on the
// same network — no more hardcoding an IP in .env that breaks later.
const dynamicHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const BACKEND_PORT = 8080;

// Dev mein Vite HTTPS pe chalta hai (voice search ke liye zaroori), lekin
// backend abhi bhi plain HTTP hai — seedha http://host:8080 call karne se
// browser "Mixed Content" bolke block kar deta hai (khaas kar mobile pe).
// Isliye dev mein hum RELATIVE paths use karte hain ('/api/v1', '' for static) —
// ye same HTTPS origin se jaate hain, aur vite.config.js ka proxy unhe
// internally backend (http://localhost:8080) tak forward kar deta hai.
// Production build mein (jahan Vite proxy nahi hota), full backend URL use hota hai.
const isDev = import.meta.env.DEV;

export const ENV = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || (isDev ? '/api/v1' : `http://${dynamicHost}:${BACKEND_PORT}/api/v1`),
  STATIC_BASE_URL:
    import.meta.env.VITE_STATIC_BASE_URL || (isDev ? '' : `http://${dynamicHost}:${BACKEND_PORT}`),
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};