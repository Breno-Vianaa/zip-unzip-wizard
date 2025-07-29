import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    // Ensure JSX runtime is properly configured
    jsxRuntime: 'automatic'
  })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./frontend/src"),
    },
  },
  root: './frontend',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 8080
  },
})