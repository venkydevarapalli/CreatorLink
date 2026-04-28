import api from './axios';

export const listCrewPosts = (params) => api.get('/crew', { params });
export const getCrewPost = (id) => api.get(`/crew/${id}`);
export const createCrewPost = (data) => api.post('/crew', data);
export const deleteCrewPost = (id) => api.delete(`/crew/${id}`);
export const applyToCrew = (id, data) => api.post(`/crew/${id}/apply`, data);
export const hireApplicant = (postId, userId) => api.post(`/crew/${postId}/hire/${userId}`);
