import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Frontend base: production = /site/classroom/ (assets at https://pi360.net/site/classroom/assets/)
// Set VITE_BASE_PATH in .env.production for production builds.
const base = process.env.VITE_BASE_PATH ?? '/'

export default defineConfig({
    base,
    plugins: [react()],
    server: {
        port: 5173,
        strictPort: true,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true
            },
            '/sync': {
                target: 'http://localhost:8000',
                changeOrigin: true
            }
        }
    }
})
