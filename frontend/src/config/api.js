// Single source for API base. No hardcoded URLs elsewhere.
// Fallback only for development when .env is not set.
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const FALLBACK = 'http://localhost:8000/api';
export const API_BASE_URL = VITE_API_BASE_URL || FALLBACK;

// Origin only (no /api) so one axios instance can call both /api/* and /analytics/*
export const API_ORIGIN = API_BASE_URL.endsWith('/api')
    ? API_BASE_URL.slice(0, -4)
    : API_BASE_URL.replace(/\/$/, '');

if (typeof VITE_API_BASE_URL === 'undefined') {
    console.warn('[ClassPy] VITE_API_BASE_URL is not set. Using fallback. Set it in .env for production.');
}
