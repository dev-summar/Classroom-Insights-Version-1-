import api from './client';

export const getStats = () => api.get('/stats');
export const syncAll = () => api.post('/sync/all');
export const getDbSource = () => api.get('/debug/db-source');
