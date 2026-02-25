import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Must match Vite base so routes stay under full URL (e.g. https://pi360.net/site/classroom/...)
const baseUrl = import.meta.env.BASE_URL || ''
let basename = baseUrl.replace(/\/$/, '') || undefined
// Fallback: when app is served from /site/classroom/ but build had base '/', still use full path for routes
if (typeof window !== 'undefined' && window.location.pathname.startsWith('/site/classroom') && !basename) {
  basename = '/site/classroom'
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter basename={basename}>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
)
