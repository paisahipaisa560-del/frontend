import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || '/api';
  let proxyTarget;
  if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
    try { proxyTarget = new URL(apiUrl).origin; } catch { proxyTarget = null; }
  } else {
    proxyTarget = env.VITE_BACKEND_URL || null;
  }
  if (!proxyTarget) {
    console.warn(
      '[vite] VITE_API_URL is relative and VITE_BACKEND_URL is not set.\n' +
      '  The Vite dev proxy will default to http://localhost:5000\n' +
      '  To fix: set VITE_API_URL to an absolute URL (e.g. http://localhost:5000/api)\n' +
      '  Or set VITE_BACKEND_URL in your .env file (e.g. VITE_BACKEND_URL=http://localhost:5000)'
    );
    proxyTarget = 'http://localhost:5000';
  }
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          ws: true,
        }
      }
    }
  };
})
