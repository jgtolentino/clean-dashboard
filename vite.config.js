import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
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
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        // Code splitting
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-charts': ['chart.js', 'recharts', 'react-chartjs-2'],
                    'vendor-maps': ['mapbox-gl', 'react-map-gl'],
                    'vendor-viz': ['plotly.js', 'react-plotly.js'],
                    'vendor-supabase': ['@supabase/supabase-js'],
                },
            },
        },
        // Source maps for production debugging
        sourcemap: true,
        // Chunk size warning limit
        chunkSizeWarningLimit: 1000,
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
});
