
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
      "@capacitor/browser": path.resolve(__dirname, "./node_modules/@capacitor/browser"),
      "@capacitor/app": path.resolve(__dirname, "./node_modules/@capacitor/app"),
      "@capacitor/core": path.resolve(__dirname, "./node_modules/@capacitor/core"),
    },
  },
  build: {
    rollupOptions: {
      external: [
        '@capacitor/app',
        '@capacitor/browser',
        '@capacitor/core'
      ]
    }
  }
}));
