import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use VITE_BASE_PATH for deployment under a subpath (e.g. /site/classroom/)
// When set, assets will load from https://domain/site/classroom/assets/...
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
