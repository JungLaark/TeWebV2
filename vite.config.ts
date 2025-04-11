import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true, // Enable source maps for easier debugging
  },
  server: {
    port: 5173, // Default port for Vite
    },
    optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
