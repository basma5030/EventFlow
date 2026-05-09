import api from './axios';

export const watchlistAPI = {
  getMyWatchlist: () =>
    api.get('/watchlist'),
  
  add: (eventId: number) =>
    api.post(`/watchlist/${eventId}`),
  
  remove: (eventId: number) =>
    api.delete(`/watchlist/${eventId}`),
  
  checkStatus: (eventId: number) =>
    api.get(`/watchlist/${eventId}/status`),
};