import axios from 'axios';

import { API_BASE_URL } from '../config/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const dashboardService = {
    getStats: () => api.get('/stats'),
    syncAll: () => api.post('/sync/all'),
    getDbSource: () => api.get('/debug/db-source'),
};

export const courseService = {
    getAll: (page = 1, search = '', limit = 10) =>
        api.get(`/courses?page=${page}&limit=${limit}&search=${search}`),
    getById: (id) => api.get(`/courses/${id}`),
};

export const teacherService = {
    getAll: (page = 1, search = '', limit = 10) =>
        api.get(`/teachers?page=${page}&limit=${limit}&search=${search}`),
};

export const studentService = {
    getAll: (page = 1, search = '', limit = 10) =>
        api.get(`/students?page=${page}&limit=${limit}&search=${search}`),
};

export const assignmentService = {
    getAll: (page = 1, search = '', limit = 10) =>
        api.get(`/assignments?page=${page}&limit=${limit}&search=${search}`),
    getById: (id, page = 1) => api.get(`/assignments/${id}?page=${page}`),
};

// Helper to get root URL from API base URL (removes /api suffix if present)
const getBaseUrl = () => {
    return API_BASE_URL.endsWith('/api')
        ? API_BASE_URL.slice(0, -4)
        : API_BASE_URL;
};

export const analyticsService = {
    getSilentStudents: (page = 1, search = '', limit = 10) =>
        axios.get(`${getBaseUrl()}/analytics/silent-students?page=${page}&limit=${limit}&search=${search}`),
    getAtRiskStudents: (page = 1, search = '', limit = 10) =>
        axios.get(`${getBaseUrl()}/analytics/at-risk-students?page=${page}&limit=${limit}&search=${search}`),
};

export default api;
