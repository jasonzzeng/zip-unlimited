import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/zip-unlimited/', // Ensures relative paths for GitHub Pages deployment
  test: {
    environment: 'jsdom',
    globals: true
  }
});