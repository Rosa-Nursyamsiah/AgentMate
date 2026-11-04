import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sharedUserApiPlugin } from './server/apiPlugin';

export default defineConfig({
  plugins: [react(), sharedUserApiPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});
