import api from './axios';

export const ticketsAPI = {
  purchase: (eventId: number) =>
    api.post(`/tickets/purchase/${eventId}`),
  
  getMyTickets: () =>
    api.get('/tickets/mytickets'),
  
  getTicket: (id: number) =>
    api.get(`/tickets/${id}`),
};