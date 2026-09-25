import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  server: {
    port: 3000,
    // /api is served by the Cloudflare Pages Functions (npm run functions:dev)
    proxy: { '/api': { target: 'http://localhost:8788', changeOrigin: true } },
  },
  // Cloudflare Pages is configured to publish build/
  build: { outDir: 'build', chunkSizeWarningLimit: 1500 },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
