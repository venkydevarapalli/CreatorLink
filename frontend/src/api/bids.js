import api from './axios';

export const createBid = (data) => api.post('/bids', data);
export const listMyBids = (params) => api.get('/bids', { params });
export const listBidsForGig = (gigId, params) => api.get(`/bids/gig/${gigId}`, { params });
export const acceptBid = (id) => api.put(`/bids/${id}/accept`);
export const rejectBid = (id) => api.put(`/bids/${id}/reject`);
export const counterBid = (id, data) => api.put(`/bids/${id}/counter`, data);
