import api from './client';

export const getAll = (page = 1, search = '', limit = 10) =>
    api.get('/api/courses', { params: { page, limit, search } });
export const getById = (id) => api.get(`/api/courses/${id}`);
