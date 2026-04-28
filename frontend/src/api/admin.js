import api from './axios';

export const listUsers = (params) => api.get('/admin/users', { params });
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const getAnalytics = () => api.get('/admin/analytics');
export const listGigsAdmin = () => api.get('/admin/gigs');
export const deleteGigAdmin = (id) => api.delete(`/admin/gigs/${id}`);
export const listCrewAdmin = () => api.get('/admin/crew');
export const deleteCrewAdmin = (id) => api.delete(`/admin/crew/${id}`);
export const listBidsAdmin = () => api.get('/admin/bids');
export const deleteBidAdmin = (id) => api.delete(`/admin/bids/${id}`);
