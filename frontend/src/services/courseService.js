import api from './client';

export const getAll = (page = 1, search = '', limit = 10) =>
    api.get('/courses', { params: { page, limit, search } });
export const getById = (id) => api.get(`/courses/${id}`);
