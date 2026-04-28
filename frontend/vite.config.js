import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Routes that should be proxied to the backend API server.
const apiPaths = [
  '/auth', '/users', '/gigs', '/bids', '/plots',
  '/crew', '/photography', '/conversations',
  '/upload', '/admin', '/reviews',
]

// Build proxy entries – skip proxying when the browser is requesting HTML
// (i.e. page navigation / refresh), so Vite serves index.html instead.
function buildProxy(paths, target) {
  const entries = {}
  for (const p of paths) {
    entries[p] = {
      target,
      changeOrigin: true,
      // Return index.html for browser navigation requests so the SPA can handle routing
      bypass(req) {
        if (req.headers.accept && req.headers.accept.includes('text/html')) {
          return '/index.html'
        }
      },
    }
  }
  return entries
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      ...buildProxy(apiPaths, 'http://127.0.0.1:8000'),
      '/ws': { target: 'ws://127.0.0.1:8000', ws: true },
    },
  },
})
