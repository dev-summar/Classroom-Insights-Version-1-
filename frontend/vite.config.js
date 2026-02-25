import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Frontend base: /site/classroom/ — production assets at https://pi360.net/site/classroom/assets/
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
