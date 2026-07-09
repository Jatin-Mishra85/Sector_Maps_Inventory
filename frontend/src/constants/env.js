export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 15000,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};