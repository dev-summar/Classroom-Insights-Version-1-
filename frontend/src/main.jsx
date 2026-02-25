import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Match Vite base so routes stay under https://pi360.net/site/classroom/ (refresh, back, forward work)
const baseUrl = import.meta.env.BASE_URL || ''
let basename = baseUrl.replace(/\/$/, '') || undefined
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
