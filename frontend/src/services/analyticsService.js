import api from './client';

export const getSilentStudents = (page = 1, search = '', limit = 10) =>
    api.get('/silent-students', { params: { page, limit, search } });
export const getAtRiskStudents = (page = 1, search = '', limit = 10) =>
    api.get('/at-risk-students', { params: { page, limit, search } });
