// Single source for API base. All API calls use absolute URL (no relative paths).
// Fallback only for development when .env is not set.
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const FALLBACK = 'http://localhost:8000/api';
export const API_BASE_URL = VITE_API_BASE_URL || FALLBACK;

// Base URL for axios: production = https://pi360.net/classrooms (so /api/* and /analytics/* are absolute)
export const API_ORIGIN = API_BASE_URL.endsWith('/api')
    ? API_BASE_URL.slice(0, -4)
    : API_BASE_URL.replace(/\/$/, '');

if (typeof VITE_API_BASE_URL === 'undefined') {
    console.warn('[ClassPy] VITE_API_BASE_URL is not set. Using fallback. Set it in .env for production.');
}
