import api from './axios';

export const eventsAPI = {
  getAll: () =>
    api.get('/events'),
  
  search: (params: { venue?: string; category?: string; date?: string }) =>
    api.get('/events/search', { params }),
  
  getMyEvents: () =>
    api.get('/events/my'),
  
  create: (formData: FormData) =>
    api.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  update: (id: number, formData: FormData) =>
    api.put(`/events/${id}`, formData),
  
  delete: (id: number) =>
    api.delete(`/events/${id}`),
};