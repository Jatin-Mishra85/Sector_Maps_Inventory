import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [react(), basicSsl()],
   // Hostinger par app /mapsheet/ subpath se serve hoti hai, isliye base wahi rakha.
  // Vercel apne aap process.env.VERCEL set karta hai build ke time — wahan root (/) chahiye.
  base: process.env.VERCEL ? "/" : "/mapsheet/",
  server: {
    port: 5173,
    host: true,
    https: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
