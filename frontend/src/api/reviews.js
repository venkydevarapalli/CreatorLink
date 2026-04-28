import api from './axios';

export const createReview = (data) => api.post('/reviews', data);
export const getUserReviews = (userId) => api.get(`/reviews/user/${userId}`);
