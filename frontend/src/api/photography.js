import api from './axios';

export const listPackages = (params) => api.get('/photography', { params });
export const getPackage = (id) => api.get(`/photography/${id}`);
export const createPackage = (data) => api.post('/photography', data);
export const updatePackage = (id, data) => api.put(`/photography/${id}`, data);
export const deletePackage = (id) => api.delete(`/photography/${id}`);
