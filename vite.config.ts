import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom', 'remotion', '@remotion/player'],
            },
          },
        },
      },
      resolve: {
        alias: {
            '@': path.resolve(__dirname, '.'),
            react: path.resolve(__dirname, 'node_modules/react'),
            'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
            remotion: path.resolve(__dirname, 'node_modules/remotion'),
        },
        dedupe: ['react', 'react-dom']
      },
      optimizeDeps: {
        include: ['@google/genai'],
        exclude: ['remotion', '@remotion/player'] // Exclude remotion from pre-bundling to avoid caching issues
      }
    };
});
