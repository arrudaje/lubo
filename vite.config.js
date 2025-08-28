import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        firebase: resolve(__dirname, 'index.js'),
      }
    }
  },
  plugins: [tailwindcss()],
  server: {
    port: 5173,
    open: true
  }
});
