import api from './axios';

export const notificationsAPI = {
  getMyNotifications: () =>
    api.get('/notifications/my'),
  
  getUnread: () =>
    api.get('/notifications/unread'),
  
  markAsRead: (id: number) =>
    api.put(`/notifications/read/${id}`),
  
  markAllAsRead: () =>
    api.put('/notifications/read-all'),
};