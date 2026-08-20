import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  server: {
    // Привязка к IPv4 loopback: на Windows дефолтный `localhost` резолвится в
    // IPv6 `::1`, и сервер не принимает подключения по `127.0.0.1`
    // (ломает туннель TestSprite и доступ с LAN).
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  plugins: [react(),
  VitePWA({
    registerType: 'autoUpdate',   // авто-обновление SW при новом деплое
    workbox: {
      // App Shell: кешируем JS/CSS/HTML — приложение запускается без сети
      globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      runtimeCaching: [
        {
          // GraphQL-запросы: network-first (пытаемся достать свежее, иначе кеш)
          urlPattern: /\/graphql/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'graphql-cache',
            expiration: { maxEntries: 50, maxAgeSeconds: 3600 },
          },
        },
        {
          // Иконки, картинки: кешируем надолго
          urlPattern: /\.(png|svg|woff2)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'static-assets',
            expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 3600 },
          },
        },
      ],
    },
    manifest: {
      name: 'Finance Dashboard',
      short_name: 'Finance',
      description: 'Track income and expenses',
      theme_color: '#aa3bff',
      background_color: '#ffffff',
      display: 'standalone',
      icons: [
        { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: 'icons/icon-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
  }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    exclude: ['@apollo/client', '@apollo/client/react'],
  },
})
