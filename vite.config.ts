import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import cesium from 'vite-plugin-cesium'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cesium()  
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    hmr: {
      overlay: true,
    },
    open: true,
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'maplibre': ['maplibre-gl'],
          'react-vendor': ['react', 'react-dom'],
          'vis-gl': ['@vis.gl/react-maplibre'],
          'cesium': ['cesium'],  
          'giro3d': ['@giro3d/react-three-fiber', '@giro3d/threejs', '@giro3d/giro3d'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['maplibre-gl', '@vis.gl/react-maplibre', 'cesium'],  
  },
})