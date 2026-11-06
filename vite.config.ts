import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }: { mode: string }) => ({
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true,
    allowedHosts: true as true,
    hmr: {
      clientPort: 443,
      port: 5000
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {
      VITE_API_BASE_URL: JSON.stringify(process.env.VITE_API_BASE_URL || '/api')
    }
  },
  plugins: [
    react(),
    // NOTE: `lovable-tagger` can be memory-hungry on some Windows setups and has caused
    // Vite to crash with "JavaScript heap out of memory". Keep it opt-in.
    mode === 'development' && process.env.ENABLE_COMPONENT_TAGGER === 'true' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
