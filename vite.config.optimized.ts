import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react'],
          'ai-vendor': ['@google/genai'],
          'export-vendor': ['html2canvas', 'jspdf', 'pptxgenjs'],
          'persistence': ['./services/persistenceService'],
          'auth': ['./services/authService'],
          'analytics': ['./services/analyticsService']
        }
      }
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 300,
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Source maps disabled for production
    sourcemap: false,
    // Target modern browsers
    target: 'esnext',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
    exclude: ['@google/genai']
  },
  server: {
    port: 3000,
    strictPort: false,
  },
  // Performance optimizations
  esbuild: {
    legalComments: 'none',
    keepNames: false,
  },
  // Preload strategy
  worker: {
    format: 'es'
  }
});
