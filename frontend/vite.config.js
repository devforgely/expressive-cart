import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request starting with /api will be routed to your target
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
});