import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      // SambaNova AI key exposed to client via import.meta.env
      // Falls back to process.env so Vercel build-time env vars are picked up
      'import.meta.env.VITE_SAMBANOVA_API_KEY': JSON.stringify(
        env.VITE_SAMBANOVA_API_KEY || process.env.VITE_SAMBANOVA_API_KEY || ''
      ),
      // Sentry DSN (optional — leave blank to disable error tracking)
      'import.meta.env.VITE_SENTRY_DSN': JSON.stringify(
        env.VITE_SENTRY_DSN || process.env.VITE_SENTRY_DSN || ''
      ),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react':  ['react', 'react-dom'],
            'vendor-motion': ['motion'],
            'vendor-pptx':   ['pptxgenjs'],
            'vendor-lucide': ['lucide-react'],
            'vendor-ui': [
              'class-variance-authority', 'clsx', 'tailwind-merge',
              '@base-ui/react',
            ],
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
    server: {
      proxy: {
        '/api/sambanova': {
          target: 'https://api.sambanova.ai/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/sambanova/, ''),
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
