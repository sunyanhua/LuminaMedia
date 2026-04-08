import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    port: 5174,
    strictPort: true, // 🚀 设为 true 彻底禁止端口自动偏移
    proxy: {
      '/api': {
        target: 'http://localhost:3003',
        changeOrigin: true,
        secure: false,
      },
    },
    watch: {
      usePolling: true, // 开启轮询以适配 Docker 挂载
      interval: 100,    // 轮询间隔
    },
  },
  plugins: [
    react(),
    // PWA已禁用 - 避免Service Worker缓存冲突
    // VitePWA({...})
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-accordion', '@radix-ui/react-alert-dialog', '@radix-ui/react-aspect-ratio', '@radix-ui/react-avatar', '@radix-ui/react-checkbox'],
          charts: ['recharts'],
          utils: ['date-fns', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          antd: ['antd', '@ant-design/icons'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});