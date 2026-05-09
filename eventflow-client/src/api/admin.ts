import api from './axios';

export const adminAPI = {
  getOrganizers: () => api.get('/admin/accounts'),
  approveOrganizer: (userId: number) => api.patch(`/admin/accounts/${userId}/approve`),
  rejectOrganizer: (userId: number) => api.delete(`/admin/accounts/${userId}/reject`),
  getPendingEvents: () => api.get('/admin/events/pending'),
  approveEvent: (eventId: number) => api.patch(`/admin/events/${eventId}/approve`),
  rejectEvent: (eventId: number, reason: string) => api.patch(`/admin/events/${eventId}/reject`, { reason }),
};