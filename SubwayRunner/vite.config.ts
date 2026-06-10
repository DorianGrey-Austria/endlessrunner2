import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8037,
    strictPort: true,
    host: true,
  },
  define: {
    global: 'globalThis',
  }
})
