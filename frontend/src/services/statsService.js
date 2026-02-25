import api from './client';

export const getStats = () => api.get('/api/stats');
export const syncAll = () => api.post('/api/sync/all');
export const getDbSource = () => api.get('/debug/db-source');
