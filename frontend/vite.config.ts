import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    visualizer({ open: false, filename: 'bundle-stats.html', gzipSize: true }),
    VitePWA({
      registerType: 'prompt',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/.*\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 300 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https?:\/\/.*\/ws\//,
            handler: 'NetworkOnly',
          },
        ],
      },
      manifest: false, // We use our own manifest.webmanifest
      devOptions: { enabled: false },
    }),
  ],
  // Inline critical CSS for above-the-fold rendering is a future enhancement.
  // It requires a custom plugin (e.g. vite-plugin-critical) and a stable CSS
  // strategy; deferred for now. cssCodeSplit is set explicitly below.
  build: {
    modulePreload: { polyfill: true },
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Vite 8 (rolldown) requires manualChunks to be a function, not an
        // object. We assign well-known vendor packages to dedicated chunks by
        // inspecting each module's path. Paths are normalised to forward
        // slashes so matching works on Windows and POSIX.
        manualChunks: (id: string) => {
          const normalized = id.replace(/\\/g, '/')
          if (!normalized.includes('/node_modules/')) {
            return undefined
          }
          if (
            normalized.includes('/react-router') ||
            normalized.includes('/@remix-run/router') ||
            normalized.includes('/react/') ||
            normalized.includes('/react-dom/') ||
            normalized.includes('/scheduler/')
          ) {
            return 'react-vendor'
          }
          if (normalized.includes('/@fluentui/')) {
            return 'fluent-vendor'
          }
          if (normalized.includes('/@tanstack/')) {
            return 'query-vendor'
          }
          return undefined
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
