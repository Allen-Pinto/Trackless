import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, 
    proxy: {
      '/api': {
        target: 'https://trackless-fxoj.onrender.com', 
        changeOrigin: true,
        secure: false, // Add this for HTTPS backend
        rewrite: (path) => path // Optional: ensures path isn't modified
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
})