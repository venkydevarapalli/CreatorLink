import api from './axios';

export const listConversations = () => api.get('/conversations');
export const createConversation = (data) => api.post('/conversations', data);
export const getConversation = (id) => api.get(`/conversations/${id}`);
export const getMessages = (id, params) => api.get(`/conversations/${id}/messages`, { params });
export const sendMessage = (id, data) => api.post(`/conversations/${id}/messages`, data);
export const markAsRead = (id) => api.post(`/conversations/${id}/read`);
export const deleteConversation = (id) => api.delete(`/conversations/${id}`);
