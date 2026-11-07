import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Mirrors nginx.conf's /v1/ proxy (the prod path to the api service),
    // so the waitlist form works against the local api in dev too.
    proxy: {
      '/v1': 'http://localhost:3000',
    },
  },
})
