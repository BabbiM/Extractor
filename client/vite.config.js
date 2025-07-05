import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { all } from 'axios'

export default defineConfig({
  plugins: [react()],
  /*server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,

        allowedHosts: [
          "1a49-196-188-252-21.ngrok-free.app", // Your exact ngrok URL
          "localhost",
          ".ngrok-free.app"
        ]
      }
    },
    cors: true,
    hmr: { clientPort: 443 }, // Fix Hot Module Reload for ngrok
  },*/
  server: {
    host: '0.0.0.0', // Force listen on all interfaces
    strictPort: false,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,PATCH,OPTIONS"
    }
  },
  build: {
    outDir: '../server/client/dist',
    emptyOutDir: true
  }
})