import api from './axios';

export const listGigs = (params) => api.get('/gigs', { params });
export const getGig = (id) => api.get(`/gigs/${id}`);
export const createGig = (data) => api.post('/gigs', data);
export const updateGig = (id, data) => api.put(`/gigs/${id}`, data);
export const deleteGig = (id) => api.delete(`/gigs/${id}`);
export const applyToGig = (id) => api.post(`/gigs/${id}/apply`);
export const acceptApplicant = (gigId, userId) => api.post(`/gigs/${gigId}/accept/${userId}`);
export const requestReview = (id) => api.post(`/gigs/${id}/request_review`);
export const completeProject = (id) => api.post(`/gigs/${id}/complete`);
