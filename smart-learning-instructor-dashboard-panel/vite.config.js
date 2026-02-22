import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false, // Disables the error overlay in the browser
    },
    port: 5173, // Ensures the server starts on the default port
  },
  resolve: {
    alias: {
      '@': '/src', // Optional: Create an alias for easier imports
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      keepNames: true, // Helps maintain class/function names in esbuild
    },
  },
  base: '/instructor/',
})
