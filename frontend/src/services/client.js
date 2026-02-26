import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: false,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.detail ?? error.message ?? 'Request failed';
        if (import.meta.env.DEV) {
            console.error('[ClassPy API]', error.config?.url, error.response?.status, message);
        }
        return Promise.reject(error);
    }
);

export default api;
