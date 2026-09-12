import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'https://hyperlocal-monsoon-intelligence.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }

  }
});
