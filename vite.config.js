import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Strategy: Tránh CORS bằng 2 lớp
// 1. Dev: Vite proxy /api và /storage -> Laravel (pano-admin.test) => same-origin cho browser
// 2. Production: Build React vào Laravel public/ => frontend và backend cùng origin, không CORS bao giờ
// Khi deploy hosting chỉ cần upload Laravel (đã chứa build), không cần CORS config
export default defineConfig({
  plugins: [react()],
  server: {
    // proxy để dev không bị CORS
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://pano-admin.test',
        changeOrigin: true,
        secure: false,
      },
      '/storage': {
        target: process.env.VITE_PROXY_TARGET || 'http://pano-admin.test',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Build ra thư mục mà Laravel có thể serve - giữ nguyên dist cho dev,
  // khi deploy sẽ copy vào laravel public (script deploy)
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
