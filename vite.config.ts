import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Split vendor code into package-based chunks to reduce single large bundles
    chunkSizeWarningLimit: 400,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            const parts = id.split('node_modules/')[1].split('/');
            const pkg = parts[0].startsWith('@') ? parts.slice(0,2).join('/') : parts[0];
            // Group key large packages into dedicated chunks
            if (pkg === 'react' || pkg === 'react-dom') return 'vendor_react';
            if (pkg.startsWith('@supabase')) return 'vendor_supabase';
            if (pkg.includes('recharts')) return 'vendor_recharts';
            if (pkg.includes('lucide-react')) return 'vendor_icons';
            if (pkg.includes('@google') || pkg.includes('openai') || pkg.includes('gpt')) return 'vendor_ai';
            return `vendor_${pkg.replace('@', '').replace('/', '_')}`;
          }
        },
      },
    },
  },
}));
