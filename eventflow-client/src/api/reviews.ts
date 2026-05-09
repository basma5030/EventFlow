import api from './axios';

export const reviewsAPI = {
  add: (eventId: number, data: { rating: number; comment: string }) =>
    api.post(`/reviews/${eventId}`, data),
  
  getEventReviews: (eventId: number) =>
    api.get(`/reviews/event/${eventId}`),
  
  getMyReviews: () =>
    api.get('/reviews/my'),
};