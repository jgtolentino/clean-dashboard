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
  build: {
    // Production optimizations
    target: 'es2020',
    minify: 'esbuild',
    // Disable source maps in production to reduce bundle size
    sourcemap: false,
    // Chunk size warning limit (quieten false positives)
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Code-splitting: separate vendor chunks for better caching
        manualChunks: {
          // Core React bundle
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // State management
          'vendor-state': ['zustand'],
          // Charts - primary (recharts is most used)
          'vendor-charts': ['recharts'],
          // Mapping - Mapbox GL (heavy, should be lazy loaded)
          'vendor-mapbox': ['mapbox-gl'],
          // Visx for lightweight SVG maps
          'vendor-visx': ['@visx/geo', '@visx/scale', '@visx/responsive', '@visx/tooltip'],
          // Plotly for advanced charts (heavy)
          'vendor-plotly': ['plotly.js-dist-min', 'react-plotly.js'],
          // Data processing
          'vendor-data': ['papaparse', 'date-fns'],
          // UI utilities
          'vendor-ui': ['lucide-react', 'clsx'],
          // Export utilities
          'vendor-export': ['file-saver', 'html2canvas'],
          // Supabase client
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
  // Optimized dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'recharts',
      'zustand',
      'lucide-react',
      '@supabase/supabase-js',
    ],
    // Exclude heavy deps that should be lazy loaded
    exclude: ['mapbox-gl'],
  },
  // Performance optimizations
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
})
