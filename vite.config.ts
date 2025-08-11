import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore eval warnings from onnxruntime-web
        if (warning.code === 'EVAL' && warning.id?.includes('onnxruntime-web')) {
          return
        }
        warn(warning)
      }
    }
  }
})