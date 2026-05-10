import api from './axios';

export const eventsAPI = {
  getAll: () => api.get('/events'),
  
  getById: (id: number) => api.get(`/events/${id}`),
  
  search: (params: { venue?: string; category?:
    string; date?: string; title?: string,searchTerm?:string}) =>
    api.get('/events/search', { params }),
  
  getMyEvents: () => api.get('/events/my'),
  
  create: (data: any) => api.post('/events', data),
  
  uploadImage: (eventId: number, formData: FormData) =>
    api.post(`/events/${eventId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  uploadMaterial: (eventId: number, formData: FormData) =>
    api.post(`/events/${eventId}/upload-material`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  deleteMaterial: (eventId: number, materialId: number) =>
    api.delete(`/events/${eventId}/materials/${materialId}`),
  
  update: (id: number, data: any) => api.put(`/events/${id}`, data),
  
  delete: (id: number) => api.delete(`/events/${id}`),
  
  getEventWithMaterials: (id: number) => api.get(`/events/${id}/with-materials`),
};