import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.js', '.vue', '.json']  
  },
  css: {     
    postcss: './postcss.config.js' 
  },
  server: {
    fs: {
      strict: false  
    },
    proxy: {
      // Proxy API requests to avoid CORS during development
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          Connection: 'keep-alive'
        }
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1600,
  }
})