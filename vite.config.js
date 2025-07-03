import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'INDX Flow - Détection Contextuelle Intelligente',
        short_name: 'INDX Flow',
        description: 'Application de détection contextuelle et génération de structures projet',
        theme_color: '#4f46e5',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 3002,
    host: true, // Permet l'accès depuis n'importe quelle IP
    hmr: {
      overlay: true, // Affiche les erreurs en overlay
      port: 3003 // Port séparé pour HMR
    },
    watch: {
      // Force le watching sur WSL/Windows
      usePolling: true,
      interval: 100
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'] // Pre-bundle pour performance
  }
})