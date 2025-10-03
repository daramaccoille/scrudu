import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/scruduithe_images': {
        target: 'http://localhost:5173/public',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
