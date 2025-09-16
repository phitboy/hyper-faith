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
  define: {
    // Fix for browser compatibility
    global: 'globalThis',
    // Fix process reference issues
    'process.env': 'import.meta.env',
  },
  optimizeDeps: {
    include: ['wagmi', 'viem', '@rainbow-me/rainbowkit'],
  },
}));
