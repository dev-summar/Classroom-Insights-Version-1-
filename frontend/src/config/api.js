// Single source for API base. Must end with /api so paths like /stats, /analytics/... resolve correctly.
const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) {
    console.error("VITE_API_BASE_URL is not defined");
}

export const API_BASE_URL = (API_BASE || (import.meta.env.DEV ? "http://localhost:8000/api" : "")).replace(/\/+$/, "");
