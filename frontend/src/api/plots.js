import api from './axios';

export const listPlots = (params) => api.get('/plots', { params });
export const getPlot = (id) => api.get(`/plots/${id}`);
export const createPlot = (data) => api.post('/plots', data);
export const updatePlot = (id, data) => api.put(`/plots/${id}`, data);
export const deletePlot = (id) => api.delete(`/plots/${id}`);
export const requestAccess = (id) => api.post(`/plots/${id}/request-access`);
export const grantAccess = (plotId, userId) => api.post(`/plots/${plotId}/grant-access/${userId}`);
export const rejectAccess = (plotId, userId) => api.post(`/plots/${plotId}/reject-access/${userId}`);
