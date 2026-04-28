import api from './axios';

export const listUsers = (params = {}) => api.get('/users', { params });
export const getUser = (id) => api.get(`/users/${id}`);
export const updateProfile = (data) => api.put('/users/me', data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
