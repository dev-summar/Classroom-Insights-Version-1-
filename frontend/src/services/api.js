import api from './client';
import * as stats from './statsService';
import * as analytics from './analyticsService';
import * as course from './courseService';

export const dashboardService = {
    getStats: stats.getStats,
    syncAll: stats.syncAll,
    getDbSource: stats.getDbSource,
};

export const analyticsService = {
    getSilentStudents: analytics.getSilentStudents,
    getAtRiskStudents: analytics.getAtRiskStudents,
};

export const courseService = {
    getAll: course.getAll,
    getById: course.getById,
};

export const teacherService = {
    getAll: (page = 1, search = '', limit = 10) =>
        api.get('/teachers', { params: { page, limit, search } }),
};

export const studentService = {
    getAll: (page = 1, search = '', limit = 10) =>
        api.get('/students', { params: { page, limit, search } }),
};

export const assignmentService = {
    getAll: (page = 1, search = '', limit = 10) =>
        api.get('/assignments', { params: { page, limit, search } }),
    getById: (id, page = 1) => api.get(`/assignments/${id}`, { params: { page } }),
};

export default api;
