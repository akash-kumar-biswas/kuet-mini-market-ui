import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            // Remove WWW-Authenticate so the browser never shows
            // the native Basic Auth dialog; our axios interceptor handles 401s.
            delete proxyRes.headers['www-authenticate']
          })
        },
      },
    },
  },
})
